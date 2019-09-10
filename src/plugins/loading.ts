import { cloneDeep } from 'lodash';
import { put } from 'redux-saga/effects';
import { Action } from 'redux';
import { IPlugin } from '../typings/plugins';
import { IEffectRecordWithModule, ISagaActionsRecord } from '../typings/handle';
import SagaActionCreator from '../lib/SagaActionCreator';

const START_LOADING = 'START_LOADING';
const END_LOADING = 'END_LOADING';

interface LoadingAction<T extends ISagaActionsRecord, K extends keyof T = keyof T> extends Action {
  actionName: keyof (T[K]['actions']);
  moduleName: K;
}

type ModuleActions<K extends SagaActionCreator> = {
  [S in keyof K['actions']]: boolean;
};

type LoadingModule<T extends ISagaActionsRecord> = {
  [K in keyof T]: ModuleActions<T[K]>;
};

type LoadingModuleWithGlobal<T extends ISagaActionsRecord> = LoadingModule<T> & {
  global: boolean;
};

const getLoadingPlugin = <Modules extends ISagaActionsRecord>(pluginName: string = 'loading') => {
  const loadingPlugin: IPlugin<Modules, LoadingModuleWithGlobal<Modules>, LoadingAction<Modules>> = {
    name: pluginName,
    getReducer(modules: Modules) {
      // map initial states
      const actions = Object.keys(modules).reduce((object, moduleName) => {
        const module = modules[moduleName];
        if (module) {
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
        }
        return object;
      }, {});

      const initState = {
        global: false,
        ...actions,
      } as LoadingModuleWithGlobal<Modules>;

      return (state = initState, action: LoadingAction<Modules>) => {
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
              if (key !== 'global' && Object.values(newState[key]).some(isLoading => isLoading === true)) {
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

  return loadingPlugin;
};

export default getLoadingPlugin;
