import { cloneDeep } from 'lodash';
import { put } from 'redux-saga/effects';
import { Action, AnyAction, Reducer } from 'redux';
import { IEffectRecordWithModule, IActionsRecord, ICreatorRecord, IActions } from '../typings/handle';
import SagaActionCreator from '../lib/SagaActionCreator';

const START_LOADING = 'START_LOADING';
const END_LOADING = 'END_LOADING';

interface ILoadingAction<T extends IActionsRecord<T>> extends Action {
  actionName: keyof SagaActionCreator<IActions<T>>['actions'];
  moduleName: keyof T;
}

type IModuleActions<A> = {
  [S in keyof SagaActionCreator<IActions<A>>['actions']]: boolean;
};

type ILoadingModule<S extends IActionsRecord<S>> = {
  [K in keyof S]: IModuleActions<S[K]>;
};

type ILoadingModuleWithGlobal<T extends IActionsRecord<T>> = ILoadingModule<T> & {
  global: boolean;
};

const getLoadingPlugin = () => {
  return {
    getReducer<A extends IActionsRecord<A>>(
      /*
      * TODO: The generic type has some problem
      * let the creators parameter temporary type to any
      * */
      creators: any
    ): Reducer<ILoadingModuleWithGlobal<A>, AnyAction> {
      // map initial states
      const actions = Object.keys(creators).reduce((object, moduleName) => {
        const module = creators[moduleName as keyof ICreatorRecord<A>];
        const actions = Object.keys(module.actions).reduce((prev, actionName) => {
          return {
            [actionName]: false,
            ...prev,
          };
        }, {});
        return {
          [moduleName]: actions,
          ...object,
        };
      }, {});

      const initState = {
        global: false,
        ...actions,
      } as ILoadingModuleWithGlobal<A>;

      return (state = initState, action: AnyAction): ILoadingModuleWithGlobal<A> => {
        let newState: ILoadingModuleWithGlobal<A>;
        let module: any;
        switch (action.type) {
          case START_LOADING:
            newState = cloneDeep(state);
            newState.global = true;
            module = newState[action.moduleName as keyof ILoadingModuleWithGlobal<A>];
            module[action.actionName] = true;
            return newState;
          case END_LOADING:
            newState = cloneDeep(state);
            module = newState[action.moduleName as keyof ILoadingModuleWithGlobal<A>];
            module[action.actionName] = false;
            newState.global = Object.keys(newState).reduce<boolean>((prev, key) => {
              if (
                key !== 'global' &&
                Object.values(newState[key as keyof ILoadingModuleWithGlobal<A>]).some(
                  isLoading => isLoading === true,
                )
              ) {
                return true;
              }
              return prev;
            }, false);
            return newState;
        }
        return state;
      };
    },
    *beforeEffect(record: IEffectRecordWithModule): Iterator<any> {
      yield put({
        type: START_LOADING,
        actionName: record.name,
        moduleName: record.moduleName,
      });
    },
    *afterEffect(record: IEffectRecordWithModule): Iterator<any> {
      yield put({
        type: END_LOADING,
        actionName: record.name,
        moduleName: record.moduleName,
      });
    },
  };
};

export default getLoadingPlugin;
