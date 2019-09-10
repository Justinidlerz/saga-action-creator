import { Action, AnyAction, Reducer } from 'redux';
import { IEffectRecordWithModule } from './handle';

type IHooksEffect = (record: IEffectRecordWithModule)  => Iterator<any>;

export interface IPlugin<Modules, State = any, A extends Action = AnyAction> {
  name: string;
  getReducer?: (modules: Modules) => Reducer<State, A>;
  beforeEffect?: IHooksEffect;
  afterEffect?: IHooksEffect;
}
