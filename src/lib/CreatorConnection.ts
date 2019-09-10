import { ReducersMapObject, AnyAction, Reducer } from 'redux';
import { takeEvery, ForkEffect, call } from 'redux-saga/effects';
import { IEffect, IEffectRecordWithModule, ISagaActionsRecord, ITakeType } from '../typings/handle';
import { IPlugin } from '../typings/plugins';

export interface Options<S extends ISagaActionsRecord> {
  // plugin list
  plugins?: IPlugin<S>[];
  // default is takeEvery
  defaultTakeType?: ITakeType;
  creators: S;
}

export type Reducers<S extends ISagaActionsRecord, P extends IPlugin<S> = any> = {
  [T in P['name']]: P['getReducer'] extends (...args: any[]) => infer R ? R : any;
}

class CreatorConnection<S extends ISagaActionsRecord, P extends Reducers<S> = any> {
  private readonly takeType: ITakeType = takeEvery;
  private readonly combinedPluginReducers: ReducersMapObject<P>;
  private readonly plugins: IPlugin<S>[] = [];
  private readonly wrappedEffects: ForkEffect[] = [];

  constructor(options: Options<S>) {
    if (options.defaultTakeType) {
      this.takeType = options.defaultTakeType;
    }
    if (options.plugins) {
      this.plugins = options.plugins;
    }
    this.combinedPluginReducers = this.combinePluginReducers(options.plugins || [], options.creators);
    this.wrappedEffects = this.wrapEffects(options.creators);
  }

  public getReducers(): ReducersMapObject<P> {
    return this.combinedPluginReducers;
  }

  public getEffects() {
    return this.wrappedEffects;
  }

  private wrapEffects(creatorRecord: S): ForkEffect[] {
    const effects: ForkEffect[] = [];
    for (const key of Object.keys(creatorRecord)) {
      const creator = creatorRecord[key];
      const records = creator.getRecord();
      for (const record of Object.values(records)) {
        const take = record.takeType || this.takeType;
        effects.push(
          take(record.actionKey, this.getSagaWrapper(record.effect, Object.assign({}, record, { moduleName: key }))),
        );
      }
    }
    return effects;
  }

  private *callBefore(record: IEffectRecordWithModule) {
    for (const plugin of this.plugins) {
      if (plugin.beforeEffect) {
        yield call(plugin.beforeEffect, record);
      }
    }
  }

  private *callAfter(record: IEffectRecordWithModule) {
    for (const plugin of this.plugins) {
      if (plugin.afterEffect) {
        yield call(plugin.afterEffect, record);
      }
    }
  }

  private combinePluginReducers(plugins: IPlugin<S>[], creators: S): ReducersMapObject<P> {
    return plugins.reduce((prev, plugin) => {
      if (plugin.getReducer) {
        return {
          [plugin.name]: plugin.getReducer(creators),
          ...prev,
        };
      }
      return prev;
    }, {}) as any;
  }

  private getSagaWrapper(handle: IEffect, record: IEffectRecordWithModule) {
    const that = this;
    return function*(action: AnyAction): Generator {
      try {
        yield that.callBefore(record);
        yield call(handle, action.payload);
      } finally {
        yield that.callAfter(record);
      }
    };
  }
}

export default CreatorConnection;
