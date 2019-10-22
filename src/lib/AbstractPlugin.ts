/**
 * AbstractPlugin
 * @author idler.zhu
 * @description Abstract plugin classes for write plugins to extends
 */
import { IDefinitionClassesRecord, IDefinitionObjectWithModule, IDefinitionsRecord } from '..';
import { Reducer } from 'redux';

class AbstractPlugin<DR extends IDefinitionsRecord<DR>, DC extends IDefinitionClassesRecord<DR>> {
  public creators: DC;
  /**
   * class constructor
   * @param creators {IDefinitionClassesRecord}
   * @description Auto add creators to plugins context
   */
  constructor(creators: DC) {
    this.creators = creators;
  }

  /**
   * getReducer
   * @description Return a plugin reducer to combine to the store
   * Notes: If you need to use this reducer state from store
   * You can mark you state to the function return type
   */
  public getReducer(): Reducer<any> {
    return () => ({});
  }

  /**
   * beforeEffect
   * @param record {IDefinitionObjectWithModule}
   * @description Before effect running hooks,
   * You can receive the running definition record from the params
   */
  public *beforeEffect(record: IDefinitionObjectWithModule): Generator<any, any, any> {}

  /**
   * afterEffect
   * @param record {IDefinitionObjectWithModule}
   * @param effectValue {any}
   * @description After effect running hooks,
   * You can receive the running definition record from the params
   */
  public *afterEffect(record: IDefinitionObjectWithModule, effectValue?: any): Generator<any, any, any> {}

  /**
   * errorHandle
   * @param error {Error}
   * @param record {IDefinitionObjectWithModule}
   * @return {Generator<any, boolean, any>}
   * @description Catch the effects thrown errors
   * If you are implemented the errorCatcher hooks,
   * You should return true to told we should not continue throw error
   */
  public *errorHandle(error: Error, record: IDefinitionObjectWithModule): Generator<any, boolean, any> {
    return false;
  }
}

export default AbstractPlugin;
