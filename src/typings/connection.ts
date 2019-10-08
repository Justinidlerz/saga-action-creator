import SagaActionCreator from '../lib/SagaActionCreator';
import AbstractPlugin from '../lib/AbstractPlugin';
import { IActions, IConstants, IDefinitionObjects, IDefinitions, ITakeType } from './creator';

export type IDefinitionsRecord<D> = {
  [K in keyof D]: IDefinitions<D[K]>;
};

export type IDefinitionClassesRecord<DR extends IDefinitionsRecord<DR>> = {
  [K in keyof DR]: SagaActionCreator<DR[K], IActions<DR[K]>, IConstants<DR[K]>, IDefinitionObjects<DR[K]>>;
};

export type IPluginDefinitions<DR extends IDefinitionsRecord<DR>, DC extends IDefinitionClassesRecord<DR>, P> = {
  [K in keyof P]: new (creators: DC) => AbstractPlugin<DR, DC>;
};

export type IPluginsInstance<
  DR extends IDefinitionsRecord<DR>,
  DC extends IDefinitionClassesRecord<DR>,
  P extends IPluginDefinitions<DR, DC, P>
> = InstanceType<P[keyof P]>[];

export type IPluginsInstanceRecord<
  DR extends IDefinitionsRecord<DR>,
  DC extends IDefinitionClassesRecord<DR>,
  P extends IPluginDefinitions<DR, DC, P>
> = {
  [K in keyof P]: InstanceType<P[K]>;
};

export type IReducersRecord<
  DR extends IDefinitionsRecord<DR>,
  DC extends IDefinitionClassesRecord<DR>,
  P extends IPluginDefinitions<DR, DC, P>
> = {
  [K in keyof P]: ReturnType<InstanceType<P[K]>['getReducer']>;
};

export interface IOptions<
  DR extends IDefinitionsRecord<DR>,
  DC extends IDefinitionClassesRecord<DR>,
  P extends IPluginDefinitions<DR, DC, P>
> {
  creators: DC;
  plugins?: P;
  defaultTakeType?: ITakeType;
}
