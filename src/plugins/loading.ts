import { cloneDeep } from 'lodash';
import { put } from 'redux-saga/effects';
import { Action, Reducer } from 'redux';
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
    getReducer<Modules extends IActionsRecord<Modules>>(
      modules: ICreatorRecord<Modules>,
    ): Reducer<ILoadingModuleWithGlobal<Modules>, ILoadingAction<Modules>> {
      // map initial states
      const actions = Object.keys(modules).reduce((object, moduleName) => {
        const module = modules[moduleName as keyof ICreatorRecord<Modules>];
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
      } as ILoadingModuleWithGlobal<Modules>;

      return (state = initState, action: ILoadingAction<Modules>): ILoadingModuleWithGlobal<Modules> => {
        let newState: ILoadingModuleWithGlobal<Modules>;
        let module: any;
        switch (action.type) {
          case START_LOADING:
            newState = cloneDeep(state);
            newState.global = true;
            module = newState[action.moduleName] as any;
            module[action.actionName] = true;
            return newState;
          case END_LOADING:
            newState = cloneDeep(state);
            module = newState[action.moduleName] as any;
            module[action.actionName] = false;
            newState.global = Object.keys(newState).reduce((prev, key) => {
              if (
                key !== 'global' &&
                Object.values(newState[key as keyof ILoadingModuleWithGlobal<Modules>]).some(
                  isLoading => isLoading === true,
                )
              ) {
                return true;
              }
              return prev;
            }, false) as any;
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
