import SagaActionCreator from './lib/SagaActionCreator';
import { ICustomEffectActions, ISagaActionsRecord, ISagaRecord } from './typings/handle';
import CreatorConnection, { Options, Reducers } from './lib/CreatorConnection';
import getLoadingPlugin from './plugins/loading';

const createSagaAction = <S extends ICustomEffectActions<S> = any>(definition: ISagaRecord<S>) =>
  new SagaActionCreator<S>(definition);

const createConnection = <S extends ISagaActionsRecord = any, P extends Reducers<S> = any>(options: Options<S>) =>
  new CreatorConnection<S, P>(options);

export { createConnection, getLoadingPlugin };
export default createSagaAction;
