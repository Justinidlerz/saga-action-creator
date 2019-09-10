import { ReducersMapObject, AnyAction } from 'redux';
import { takeEvery, ForkEffect, call } from 'redux-saga/effects';
import {
  IEffect,
  IEffectRecordWithModule,
  IActionsRecord,
  ITakeType,
  ICreatorRecord,
  IEffectRecord,
  IReducers,
} from '../typings/handle';
import { IPlugin, IPlugins } from '../typings/plugins';

export interface Options<A extends IActionsRecord<A>, R> {
  // plugin list
  plugins?: IPlugins<A, R>;
  // default is takeEvery
  defaultTakeType?: ITakeType;
  creators: ICreatorRecord<A>;
}

class CreatorConnection<A extends IActionsRecord<A>, R = any> {
  private readonly takeType: ITakeType;
  private readonly combinedPluginReducers: ReducersMapObject<IReducers<A, R>>;
  private readonly plugins: IPlugin<A, R>[];
  private readonly wrappedEffects: ForkEffect[] = [];

  constructor(options: Options<A, R>) {
    this.takeType = options.defaultTakeType = takeEvery;
    this.plugins = Object.values(options.plugins || {});
    this.combinedPluginReducers = this.combinePluginReducers(options.plugins, options.creators);
    this.wrappedEffects = this.wrapEffects(options.creators);
  }

  public getReducers(): ReducersMapObject<IReducers<A, R>> {
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

  private combinePluginReducers(
    plugins: IPlugins<A, R> | undefined,
    creators: ICreatorRecord<A>,
  ): ReducersMapObject<IReducers<A, R>> {
    if (!plugins) {
      return {} as any;
    }
    return Object.keys(plugins).reduce((prev, key) => {
      const plugin = plugins[key as keyof IPlugins<A, R>];
      if (plugin.getReducer) {
        return {
          [key]: plugin.getReducer(creators),
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
