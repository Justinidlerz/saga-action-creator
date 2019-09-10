import { cloneDeep } from 'lodash';
import { put } from 'redux-saga/effects';
import { Action } from 'redux';
import { IPlugin } from '../typings/plugins';
import { IEffectRecordWithModule, IActionsRecord, ICreatorRecord, IActions } from '../typings/handle';
import SagaActionCreator from '../lib/SagaActionCreator';

const START_LOADING = 'START_LOADING';
const END_LOADING = 'END_LOADING';

interface LoadingAction<T extends IActionsRecord<T>> extends Action {
  actionName: keyof (keyof SagaActionCreator<IActions<T>>['actions']);
  moduleName: keyof T;
}

type ModuleActions<A> = {
  [S in keyof SagaActionCreator<IActions<A>>['actions']]: boolean;
};

type LoadingModule<S extends IActionsRecord<S>> = {
  [K in keyof S]: ModuleActions<S[K]>;
};

type LoadingModuleWithGlobal<T extends IActionsRecord<T>> = LoadingModule<T> & {
  global: boolean;
};

const getLoadingPlugin = <Modules extends IActionsRecord<Modules>>(
  pluginName: string = 'loading',
): IPlugin<Modules, LoadingModuleWithGlobal<Modules>, LoadingAction<Modules>> => {
  return {
    name: pluginName,
    getReducer(modules: ICreatorRecord<Modules>) {
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
      } as LoadingModuleWithGlobal<Modules>;

      return (state = initState, action: LoadingAction<Modules>): LoadingModuleWithGlobal<Modules> => {
        let newState: LoadingModuleWithGlobal<Modules>;
        switch (action.type) {
          case START_LOADING:
            newState = cloneDeep(state);
            newState.global = true;
            newState[action.moduleName][action.actionName] = true as any;
            return newState;
          case END_LOADING:
            newState = cloneDeep(state);
            newState[action.moduleName][action.actionName] = false as any;
            newState.global = Object.keys(newState).reduce((prev, key) => {
              if (
                key !== 'global' &&
                Object.values(newState[key as keyof LoadingModuleWithGlobal<Modules>]).some(
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
