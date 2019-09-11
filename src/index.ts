import SagaActionCreator from './lib/SagaActionCreator';
import { IActions, IActionsRecord, ISagaRecord } from './typings/handle';
import CreatorConnection, { Options } from './lib/CreatorConnection';
import getLoadingPlugin from './plugins/loading';

const createSagaActions = <S extends IActions<S>>(definition: ISagaRecord<S>) =>
  new SagaActionCreator<S>(definition);

const createConnection = <A extends IActionsRecord<A>, R>(options: Options<A, R>) =>
  new CreatorConnection<A, R>(options);

export { createConnection, getLoadingPlugin };
export default createSagaActions;
