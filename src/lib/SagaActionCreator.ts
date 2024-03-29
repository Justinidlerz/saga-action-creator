/**
 * SagaActionCreator
 * @author idler.zhu
 * @description Auto create redux actions from generation functions
 */
import snakeCase from 'lodash/snakeCase';
import toUpper from 'lodash/toUpper';
import uniqueId from 'lodash/uniqueId';
import {
  IDefinitions,
  IActions,
  IConstants,
  IDefinitionObjects,
  IActionCreator,
  IFlattenDefinitions,
} from '../typings/creator';

class SagaActionCreator<
  D extends IDefinitions<D>,
  A extends IActions<D>,
  C extends IConstants<D>,
  DO extends IDefinitionObjects<D>
> {
  protected readonly _actions: A;
  protected readonly _constants: C;
  protected readonly record: DO;
  protected _connectedEffects: IFlattenDefinitions<D>;
  protected _originEffects: IFlattenDefinitions<D>;
  /**
   * class constructor
   * @param definitions {IDefinitions}
   */
  constructor(definitions: D) {
    this._originEffects = this.getFlattenEffects(definitions);
    // set the original effect for it by default
    // the actual effect is set from the connection
    this._connectedEffects = this._originEffects;
    this.record = this.createRecord(definitions);
    this._actions = this.createActions();
    this._constants = this.mapConstants();
  }

  /**
   * get connectedEffects
   * @return {IDefinitions}
   * @description Return the effects wrapped from the connection
   */
  public get connectedEffects(): IFlattenDefinitions<D> {
    return this._connectedEffects;
  }

  /**
   * get effects
   * @return {IDefinitions}
   * @description Return the effects passed by definition
   */
  public get effects(): IFlattenDefinitions<D> {
    return this._originEffects;
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
   * setWrappedEffects
   * @param effects {IDefinitions}
   * @description Set the connected effects from the connection
   */
  public setWrappedEffects(effects: IFlattenDefinitions<D>) {
    this._connectedEffects = effects;
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

  protected getFlattenEffects(definitions: D): IFlattenDefinitions<D> {
    const record: any = {};
    for (const key of Object.keys(definitions)) {
      const value = definitions[key as keyof D];
      if (value instanceof Function) {
        record[key] = value;
      } else {
        record[key] = (value as any).effect;
      }
    }
    return record;
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
