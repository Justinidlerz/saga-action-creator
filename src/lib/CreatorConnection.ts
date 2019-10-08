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
} from '../typings/connection';

class CreatorConnection<
  DR extends IDefinitionsRecord<DR>,
  DC extends IDefinitionClassesRecord<DR>,
  P extends IPluginDefinitions<DR, DC, P>,
  RR extends IReducersRecord<DR, DC, P>
> {
  private readonly takeType: ITakeType;
  private readonly plugins: IPluginsInstance<DR, DC, P>;
  private readonly wrappedEffects: ForkEffect[] = [];
  private readonly combinedPluginReducers: RR;

  /**
   * class constructor
   * @param options {IOptions}
   */
  constructor(options: IOptions<DR, DC, P>) {
    this.takeType = options.defaultTakeType = takeEvery;
    const plugins = this.makePlugins(Object.assign(options.plugins, {}), options.creators);
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
  private makePlugins(
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
  private combinePluginReducers(plugins: IPluginsInstanceRecord<DR, DC, P>): RR {
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
  private wrapEffects(creators: DC): ForkEffect[] {
    const effects: ForkEffect[] = [];
    for (const key of Object.keys(creators)) {
      const creator = creators[key as keyof DC];
      const records = creator.getRecord();
      for (const record of Object.values<IDefinitionObject>(records)) {
        const take = record.takeType || this.takeType;
        const handle = this.getSagaWrapper(record.effect, Object.assign({}, record, { moduleName: key }));
        effects.push(take(record.actionKey, handle));
      }
    }
    return effects;
  }

  /**
   * callBefore
   * @param record {IDefinitionObjectWithModule}
   * @description Called before hooks from the plugins
   */
  private *callBefore(record: IDefinitionObjectWithModule) {
    for (const plugin of this.plugins) {
      if (plugin.beforeEffect) {
        yield call(plugin.beforeEffect as any, record);
      }
    }
  }

  /**
   * callAfter
   * @param record {IDefinitionObjectWithModule}
   * @description Called after hooks from the plugins
   */
  private *callAfter(record: IDefinitionObjectWithModule) {
    for (const plugin of this.plugins) {
      if (plugin.afterEffect) {
        yield call(plugin.afterEffect as any, record);
      }
    }
  }

  /**
   * getSagaWrapper
   * @param handle {IEffect}
   * @param record {IDefinitionObjectWithModule}
   * @description Return a calling the hooks and effect function
   */
  private getSagaWrapper(handle: IEffect, record: IDefinitionObjectWithModule) {
    const that = this;
    return function*(action: IArgsAction): Generator {
      try {
        yield that.callBefore(record);
        yield call(handle, ...action.args);
      } finally {
        yield that.callAfter(record);
      }
    };
  }
}

export default CreatorConnection;
