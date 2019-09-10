import SagaActionCreator from './lib/SagaActionCreator';
import { IActions, IActionsRecord, ISagaRecord } from './typings/handle';
import CreatorConnection, { Options, State } from './lib/CreatorConnection';
import getLoadingPlugin from './plugins/loading';
import { IPlugin } from './typings/plugins';

const createSagaActions = <S extends IActions<S>>(definition: ISagaRecord<S>) =>
  new SagaActionCreator<S>(definition);

const createConnection = <A extends IActionsRecord<A>, S extends State<A, P>, P extends IPlugin<A> = any>(options: Options<A, P>) =>
  new CreatorConnection<A, S, P>(options);

export { createConnection, getLoadingPlugin };
export default createSagaActions;
