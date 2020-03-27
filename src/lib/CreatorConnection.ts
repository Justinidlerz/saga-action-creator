/**
 * CreatorConnection
 * @author idler.zhu
 * @description To connect the defined SagaActionCreators and plugins
 */
import { takeEvery, ForkEffect, call } from 'redux-saga/effects';
import { IArgsAction, IDefinitionObject, IDefinitionObjectWithModule, IEffect, ITakeType } from '../typings/creator';
import {
  IOptions,
  IPluginsInstance,
  IReducersRecord,
  IDefinitionsRecord,
  IDefinitionClassesRecord,
  IPluginDefinitions,
  IPluginsInstanceRecord,
  IGetSagaWrapperOptions
} from '../typings/connection';

class CreatorConnection<
  DR extends IDefinitionsRecord<DR>,
  DC extends IDefinitionClassesRecord<DR>,
  P extends IPluginDefinitions<DR, DC, P>,
  RR extends IReducersRecord<DR, DC, P>
> {
  protected readonly takeType: ITakeType;
  protected readonly plugins: IPluginsInstance<DR, DC, P>;
  protected readonly wrappedEffects: ForkEffect[] = [];
  protected readonly combinedPluginReducers: RR;

  /**
   * class constructor
   * @param options {IOptions}
   */
  constructor(options: IOptions<DR, DC, P>) {
    this.takeType = options.defaultTakeType || takeEvery;
    const plugins = this.makePlugins(Object.assign(options.plugins || ({} as P), {}), options.creators);
    this.plugins = plugins.instances;
    this.combinedPluginReducers = this.combinePluginReducers(plugins.record);
    this.wrappedEffects = this.wrapEffects(options.creators);
  }

  /**
   * getReducers
   * @description Return plugins called getReducer
   */
  public getReducers(): RR {
    return this.combinedPluginReducers;
  }

  /**
   * getEffects
   * @description Return the combined saga-effects
   */
  public getEffects(): ForkEffect[] {
    return this.wrappedEffects;
  }

  /**
   * makePlugins
   * @param plugins {IPluginDefinitions}
   * @param creators {IDefinitionClassesRecord}
   * @description Auto make plugin instance and inject the creators
   */
  protected makePlugins(
    plugins: P,
    creators: DC,
  ): {
    record: IPluginsInstanceRecord<DR, DC, P>;
    instances: IPluginsInstance<DR, DC, P>;
  } {
    const pluginsRecord: any = {};
    const pluginInstances: any[] = [];
    for (const key of Object.keys(plugins)) {
      const plugin = plugins[key as keyof P];
      const pluginInstance = new plugin(creators);
      pluginsRecord[key] = pluginInstance;
      pluginInstances.push(pluginInstance);
    }
    return {
      record: pluginsRecord,
      instances: pluginInstances,
    };
  }

  /**
   * combinePluginReducers
   * @param plugins {IPluginsInstanceRecord}
   * @description Combine called getReducer from plugins
   */
  protected combinePluginReducers(plugins: IPluginsInstanceRecord<DR, DC, P>): RR {
    return Object.keys(plugins).reduce((prev, key) => {
      const plugin = plugins[key as keyof IPluginsInstanceRecord<DR, DC, P>];
      return {
        [key]: plugin.getReducer(),
        ...prev,
      };
    }, {}) as any;
  }

  /**
   * wrapEffects
   * @param creators {IDefinitionClassesRecord}
   * @description Create effects from the configuration
   */
  protected wrapEffects(creators: DC): ForkEffect[] {
    const effects: ForkEffect[] = [];
    for (const key of Object.keys(creators)) {
      const creator = creators[key as keyof DC];
      const records = creator.getRecord();
      const wrappedEffect: any = {};
      for (const record of Object.values<IDefinitionObject>(records)) {
        const take = record.takeType || this.takeType;
        const handle = this.getSagaWrapper(record.effect, Object.assign({}, record, { moduleName: key }));
        const handleForWrappedEffect = this.getSagaWrapper(record.effect, Object.assign({}, record, { moduleName: key }), { withoutErrorHandle: true });
        wrappedEffect[record.name] = this.makeWrappedEffect(handleForWrappedEffect);
        effects.push(take(record.actionKey, handle));
      }
      // Rewrite the wrapped effect to the creator
      creator.setWrappedEffects(wrappedEffect);
    }
    return effects;
  }

  /**
   * callBefore
   * @param record {IDefinitionObjectWithModule}
   * @description Called before hooks from the plugins
   */
  protected *callBefore(record: IDefinitionObjectWithModule) {
    for (const plugin of this.plugins) {
      yield call(plugin.beforeEffect as any, record);
    }
  }

  /**
   * callAfter
   * @param record {IDefinitionObjectWithModule}
   * @param effectValue {any}
   * @description Called after hooks from the plugins
   */
  protected *callAfter(record: IDefinitionObjectWithModule, effectValue: any) {
    for (const plugin of this.plugins) {
      yield call(plugin.afterEffect as any, record, effectValue);
    }
  }

  /**
   * errorHandling
   * @param record {IDefinitionObjectWithModule}
   * @param error {Error}
   * @description Called error handling from the plugins
   */
  protected *errorHandling(record: IDefinitionObjectWithModule, error: Error) {
    let isHandedError = false;
    for (const plugin of this.plugins) {
      const handed = yield call(plugin.errorHandle, error, record);
      if (handed) {
        isHandedError = true;
      }
    }
    if (!isHandedError) {
      error.message = `[Saga-action-creator] Unhandled error:
      It seems to have some hidden danger for your App
      Can use the errorHandler plugin.
      ${error.message}`;
      throw error;
    }
  }

  /**
   * getSagaWrapper
   * @param handle {IEffect}
   * @param record {IDefinitionObjectWithModule}
   * @param options {IGetSagaWrapperOptions}
   * @description Return a calling the hooks and effect function
   */
  protected getSagaWrapper(handle: IEffect, record: IDefinitionObjectWithModule, options?: IGetSagaWrapperOptions) {
    const that = this;
    return function*(action: IArgsAction): Generator<any, any, any> {
      let effectValue: any;
      try {
        yield that.callBefore(record);
        effectValue = yield call(handle, ...action.args);
      } catch (e) {
        if (!options?.withoutErrorHandle) {
          yield that.errorHandling(record, e);
        }
      } finally {
        yield that.callAfter(record, effectValue);
      }
    };
  }

  /**
   * makeWrappedEffect
   * @param wrappedSaga {}
   */
  protected makeWrappedEffect(wrappedSaga: (action: IArgsAction) => Generator<any, any, any>) {
    return function*(...args: any[]): Generator<any, any, any> {
      return yield wrappedSaga({ type: '', args });
    };
  }
}

export default CreatorConnection;
