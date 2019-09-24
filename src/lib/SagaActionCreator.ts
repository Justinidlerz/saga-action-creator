/**
 * SagaActionCreator
 * @author idler.zhu
 * @description Auto create redux actions from generation functions
 */
import { snakeCase, toUpper, uniqueId } from 'lodash';
import { IActions, IEffectsRecord, ISagaRecord, IConstantsRecord } from '../typings/handle';
import { ActionCreator, AnyAction } from 'redux';

class SagaActionCreator<A extends IActions<A>> {
  private readonly _actions: A;
  private readonly _constants: IConstantsRecord<A>;
  private readonly record: IEffectsRecord<A>;

  /**
   * class constructor
   * @param definitions {ISagaRecord}
   */
  constructor(definitions: ISagaRecord<A>) {
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
   * @return {IConstantsRecord}
   * @description Return a created action constants record,
   * constant keys both as from the initial definitions key
   */
  public get constants(): IConstantsRecord<A> {
    return this._constants;
  }

  /**
   * getRecord
   * @return {IEffectsRecord}
   * @description Return a created record wrapped constants
   * and effect and original action key and takeType
   */
  public getRecord(): IEffectsRecord<A> {
    return this.record;
  }

  /**
   * mapConstants
   * @return {IConstantsRecord}
   * @description Extract constants from created effect record
   */
  private mapConstants(): IConstantsRecord<A> {
    const constantsMap: any = {};
    for (const key of Object.keys(this.record)) {
      const value = this.record[key as keyof A];
      constantsMap[key] = value.actionKey;
    }
    return constantsMap;
  }

  /**
   * createActions
   * @return {IActions}
   * @description Generate actions from create effect record
   */
  private createActions(): A {
    const actions: any = {};
    for (const key of Object.keys(this.record)) {
      const value = this.record[key as keyof A];
      // TODO: Add action payload params from effect.
      actions[key] = SagaActionCreator.getAction(value.actionKey);
    }
    return actions;
  }

  /**
   * createRecord
   * @param definitions {ISagaRecord}
   * @description Generate record wrapped constants
   * and effect and original action key and takeType
   */
  private createRecord(definitions: ISagaRecord<A>): IEffectsRecord<A> {
    const record: any = {};
    for (const key of Object.keys(definitions)) {
      const value = definitions[key as keyof A];
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
  public static getAction(actionName: string): ActionCreator<AnyAction> {
    return (payload?: any) => ({
      type: actionName,
      payload,
    });
  }
}

export default SagaActionCreator;
