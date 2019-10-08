/**
 * AbstractPlugin
 * @author idler.zhu
 * @description Abstract plugin classes for write plugins to extends
 */
import { IDefinitionClassesRecord, IDefinitionsRecord } from '../typings/connection';
import { IDefinitionObjectWithModule } from '../typings/creator';
import { Reducer } from 'redux';

abstract class AbstractPlugin<DR extends IDefinitionsRecord<DR>, DC extends IDefinitionClassesRecord<DR>> {
  /**
   * class constructor
   * @param creators {IDefinitionClassesRecord}
   * @description Auto add creators to plugins context
   */
  protected constructor(public creators: DC) {}

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
   * @description After effect running hooks,
   * You can receive the running definition record from the params
   */
  public *afterEffect(record: IDefinitionObjectWithModule): Generator<any, any, any> {}
}

export default AbstractPlugin;
