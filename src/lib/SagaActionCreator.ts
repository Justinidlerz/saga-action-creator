/**
 * SagaActionCreator
 * @author idler.zhu
 * @description Auto create redux actions from generation functions
 */
import { snakeCase, toUpper, uniqueId } from 'lodash';
import { IDefinitions, IActions, IConstants, IDefinitionObjects, IActionCreator } from '../typings/creator';

class SagaActionCreator<
  D extends IDefinitions<D>,
  A extends IActions<D>,
  C extends IConstants<D>,
  DO extends IDefinitionObjects<D>
> {
  protected readonly _actions: A;
  protected readonly _constants: C;
  protected readonly record: DO;

  /**
   * class constructor
   * @param definitions {IDefinitions}
   */
  constructor(definitions: D) {
    this.record = this.createRecord(definitions);
    this._actions = this.createActions();
    this._constants = this.mapConstants();
  }

  /**
   * get actions
   * @return {IActions}
   * @description Return a created action creators record,
   * action keys both as from the initial definitions key
   */
  public get actions(): A {
    return this._actions;
  }

  /**
   * get constants
   * @return {IConstants}
   * @description Return a created action constants record,
   * constant keys both as from the initial definitions key
   */
  public get constants(): C {
    return this._constants;
  }

  /**
   * getRecord
   * @return {IDefinitionObjects}
   * @description Return a created record wrapped constants
   * and effect and original action key and takeType
   */
  public getRecord(): DO {
    return this.record;
  }

  /**
   * mapConstants
   * @return {IConstants}
   * @description Extract constants from created effect record
   */
  protected mapConstants(): C {
    const constantsMap: any = {};
    for (const key of Object.keys(this.record)) {
      const value = this.record[key as keyof D];
      constantsMap[key] = value.actionKey;
    }
    return constantsMap;
  }

  /**
   * createActions
   * @return {IActions}
   * @description Generate actions from create effect record
   */
  protected createActions(): A {
    const actions: any = {};
    for (const key of Object.keys(this.record)) {
      const value = this.record[key as keyof D];
      actions[key] = SagaActionCreator.getAction(value.actionKey);
    }
    return actions;
  }

  /**
   * createRecord
   * @param definitions {IDefinitions}
   * @description Generate record wrapped constants
   * and effect and original action key and takeType
   */
  protected createRecord(definitions: D): DO {
    const record: any = {};
    for (const key of Object.keys(definitions)) {
      const value = definitions[key as keyof D];
      const actionKey = toUpper(snakeCase(`${key}_${uniqueId()}`));
      if (value instanceof Function) {
        record[key] = {
          name: key,
          actionKey,
          effect: value,
        };
      } else {
        record[key] = {
          name: key,
          actionKey,
          ...value,
        };
      }
    }
    return record;
  }

  /**
   * getAction
   * @param actionName {string}
   * @return {ActionCreator}
   * @description Generate action creator with action name
   */
  public static getAction(actionName: string): IActionCreator<any> {
    return (...args: any[]) => ({
      type: actionName,
      args,
    });
  }
}

export default SagaActionCreator;
