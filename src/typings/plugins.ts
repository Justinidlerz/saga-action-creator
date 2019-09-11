import { Action, AnyAction, Reducer } from 'redux';
import { IActionsRecord, ICreatorRecord, IEffectRecordWithModule } from './handle';

type IHooksEffect = (record: IEffectRecordWithModule)  => Iterator<any>;

export interface IPlugin<AR extends IActionsRecord<AR>, State, A extends Action = AnyAction> {
  getReducer?: (creators: ICreatorRecord<AR>) => Reducer<State, A>;
  beforeEffect?: IHooksEffect;
  afterEffect?: IHooksEffect;
}

export type IPlugins<A extends IActionsRecord<A>, S> = {
  [K in keyof S]: IPlugin<A, S[K]>;
}
