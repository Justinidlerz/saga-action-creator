import { snakeCase, toUpper, uniqueId } from 'lodash';
import { IActions, IEffectsRecord, ISagaRecord } from '../typings/handle';
import { ActionCreator, AnyAction } from 'redux';

class SagaActionCreator<A extends IActions<A>> {
  private readonly _actions: A;
  private readonly record: IEffectsRecord<A>;

  constructor(definitions: ISagaRecord<A>) {
    this.record = this.createRecord(definitions);
    this._actions = this.createActions();
  }

  public get actions(): A {
    return this._actions;
  }

  public getRecord(): IEffectsRecord<A> {
    return this.record;
  }

  private createActions(): A {
    const actions: any = {};
    for (const key of Object.keys(this.record)) {
      const value = this.record[key as keyof A];
      actions[key] = SagaActionCreator.getAction(value.actionKey);
    }
    return actions;
  }

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

  public static getAction(actionName: string): ActionCreator<AnyAction> {
    return (payload?: any) => ({
      type: actionName,
      payload,
    });
  }
}

export default SagaActionCreator;
