import SagaActionCreator from './lib/SagaActionCreator';
import { IActions, IConstants, IDefinitionObjects, IDefinitions } from './typings/creator';
import {
  IDefinitionClassesRecord,
  IDefinitionsRecord,
  IOptions,
  IPluginDefinitions,
  IReducersRecord,
} from './typings/connection';
import CreatorConnection from './lib/CreatorConnection';
import AbstractPlugin from './lib/AbstractPlugin';

import getLoadingPlugin from './plugins/loading';

const createSagaActions = <
  D extends IDefinitions<D>,
  A extends IActions<D>,
  C extends IConstants<D>,
  DO extends IDefinitionObjects<D>
>(
  definitions: D,
) => new SagaActionCreator<D, A, C, DO>(definitions);

const createConnection = <
  DR extends IDefinitionsRecord<DR>,
  DC extends IDefinitionClassesRecord<DR>,
  P extends IPluginDefinitions<DR, DC, P>,
  RR extends IReducersRecord<DR, DC, P>
>(
  options: IOptions<DR, DC, P>,
) => new CreatorConnection<DR, DC, P, RR>(options);

export { createConnection, getLoadingPlugin, AbstractPlugin };
export default createSagaActions;
