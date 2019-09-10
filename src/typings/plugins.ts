import { Action, AnyAction, Reducer } from 'redux';
import { IActionsRecord, ICreatorRecord, IEffectRecordWithModule } from './handle';

type IHooksEffect = (record: IEffectRecordWithModule)  => Iterator<any>;

export interface IPlugin<C extends IActionsRecord<C>, State = any, A extends Action = AnyAction> {
  name: string;
  getReducer?: (modules: ICreatorRecord<C>) => Reducer<State, A>;
  beforeEffect?: IHooksEffect;
  afterEffect?: IHooksEffect;
}
