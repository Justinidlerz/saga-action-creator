import { ForkEffect } from 'redux-saga/effects';
import { AnyAction, ActionCreator } from 'redux';
import SagaActionCreator from '../lib/sagaActionCreator';

export type ITakeType = (...args: any[]) => ForkEffect;
export type IEffect = (payload: any) => Iterator<any>;

export interface IHandleItem {
  takeType: ITakeType;
  effect: IEffect;
}

export type ISagaHandleItem = IEffect | IHandleItem;

export type ISagaRecord<Name> = {
  [T in keyof Name]: ISagaHandleItem;
}

type ICustomActionCreator<P> = (payload?: P) => AnyAction;

export type ICustomEffectActions<E> = {
  [K in keyof E]: ICustomActionCreator<E[K]>
};

export interface IEffectRecord {
  actionKey: string;
  name: string;
  takeType?: ITakeType;
  effect: IEffect;
}

export type IEffectsRecord<S> = Record<keyof S, IEffectRecord>

export interface IEffectRecordWithModule extends IEffectRecord {
  moduleName: string;
}

export type ISagaActionsRecord = Record<string, SagaActionCreator>;
