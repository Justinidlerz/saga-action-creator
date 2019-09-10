import { snakeCase, toUpper, uniqueId } from 'lodash';
import { ICustomEffectActions, IEffectsRecord, ISagaRecord } from '../typings/handle';
import { ActionCreator, AnyAction } from 'redux';

class SagaActionCreator<S extends ICustomEffectActions<S> = any> {
  private readonly _actions: S;
  private readonly record: IEffectsRecord<S>;

  constructor(definitions: ISagaRecord<S>) {
    this.record = this.createRecord(definitions);
    this._actions = this.createActions();
  }

  public get actions(): S {
    return this._actions;
  }

  public getRecord(): IEffectsRecord<S> {
    return this.record;
  }

  private createActions(): S {
    const actions: any = {};
    for (const key of Object.keys(this.record)) {
      const value = this.record[key as keyof S];
      actions[key] = SagaActionCreator.getAction(value.actionKey);
    }
    return actions;
  }

  private createRecord(definitions: ISagaRecord<S>): IEffectsRecord<S> {
    const record: any = {};
    for (const key of Object.keys(definitions)) {
      const value = definitions[key as keyof S];
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

  public static getAction(actionName: string): ActionCreator<AnyAction> {
    return (payload?: any) => ({
      type: actionName,
      payload,
    });
  }
}

export default SagaActionCreator;
