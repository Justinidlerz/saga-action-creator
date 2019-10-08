import { ForkEffect } from 'redux-saga/effects';

export type ITakeType = (...args: any[]) => ForkEffect;
export type IEffect = (...args: any[]) => Generator<any, any, any>;

export interface IEffectItem {
  takeType: ITakeType;
  effect: IEffect;
}

export type IDefinition = IEffect | IEffectItem;

export type IArgsAction<Args = any[]> = {
  type: string;
  args: Args;
};

export type IActionCreator<Fn extends (...args: any[]) => any> = (
  ...args: Parameters<Fn>
) => IArgsAction<Parameters<Fn>>;

export type IAction<D extends IDefinition> = D extends IEffectItem
  ? IActionCreator<D['effect']>
  : D extends IEffect
  ? IActionCreator<D>
  : never;

export type IActions<D extends IDefinitions<D>> = {
  [K in keyof D]: IAction<D[K]>;
};

export type IDefinitions<D> = Record<keyof D, IDefinition>;

export type IConstants<D extends IDefinitions<D>> = Record<keyof D, string>;

export interface IDefinitionObject {
  actionKey: string;
  name: string;
  takeType?: ITakeType;
  effect: IEffect;
}

export interface IDefinitionObjectWithModule extends IDefinitionObject {
  moduleName: string;
}

export type IDefinitionObjects<D extends IDefinitions<D>> = Record<keyof D, IDefinitionObject>;
