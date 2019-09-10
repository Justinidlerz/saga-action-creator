import { ReducersMapObject, AnyAction } from 'redux';
import { takeEvery, ForkEffect, call } from 'redux-saga/effects';
import {
  IEffect,
  IEffectRecordWithModule,
  IActionsRecord,
  ITakeType,
  ICreatorRecord,
  IEffectRecord,
} from '../typings/handle';
import { IPlugin } from '../typings/plugins';

export interface Options<A extends IActionsRecord<A>, P extends IPlugin<A>> {
  // plugin list
  plugins?: P[];
  // default is takeEvery
  defaultTakeType?: ITakeType;
  creators: ICreatorRecord<A>;
}

export type State<A extends IActionsRecord<A>, P extends IPlugin<A>> = {
  [T in P['name']]: string;
};

// S should be a creator actions record
// P should be a plugins reducer record
class CreatorConnection<A extends IActionsRecord<A>, S extends State<A, P>, P extends IPlugin<A> = any> {
  private readonly takeType: ITakeType = takeEvery;
  private readonly combinedPluginReducers: ReducersMapObject<S>;
  private readonly plugins: P[];
  private readonly wrappedEffects: ForkEffect[] = [];

  constructor(options: Options<A, P>) {
    if (options.defaultTakeType) {
      this.takeType = options.defaultTakeType;
    }
    this.plugins = options.plugins || [];
    this.combinedPluginReducers = this.combinePluginReducers(options.plugins || [], options.creators);
    this.wrappedEffects = this.wrapEffects(options.creators);
  }

  public getReducers(): ReducersMapObject<S> {
    return this.combinedPluginReducers;
  }

  public getEffects() {
    return this.wrappedEffects;
  }

  private wrapEffects(creatorRecord: ICreatorRecord<A>): ForkEffect[] {
    const effects: ForkEffect[] = [];
    for (const key of Object.keys(creatorRecord)) {
      const creator = creatorRecord[key as keyof ICreatorRecord<A>];
      const records = creator.getRecord();
      for (const record of Object.values<IEffectRecord>(records)) {
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

  private combinePluginReducers(plugins: IPlugin<A>[], creators: ICreatorRecord<A>): ReducersMapObject<S> {
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
