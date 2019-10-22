import { cloneDeep } from 'lodash';
import { put } from 'redux-saga/effects';
import { AnyAction, Reducer } from 'redux';
import AbstractPlugin from '../lib/AbstractPlugin';
import { IDefinitionClassesRecord, IDefinitionsRecord } from '../typings/connection';
import { IDefinitionObjectWithModule } from '../typings/creator';

const START_LOADING = 'START_LOADING';
const END_LOADING = 'END_LOADING';

type ILoadingModule<DR extends IDefinitionsRecord<DR>, DC extends IDefinitionClassesRecord<DR>> = {
  [K in keyof DC]: {
    [Key in keyof DC[K]['actions']]: boolean;
  };
};

type ILoadingModuleWithGlobal<
  DR extends IDefinitionsRecord<DR>,
  DC extends IDefinitionClassesRecord<DR>
> = ILoadingModule<DR, DC> & {
  global: boolean;
};

const getLoadingPlugin = () => {
  return class Loading<
    DR extends IDefinitionsRecord<DR>,
    DC extends IDefinitionClassesRecord<DR>
  > extends AbstractPlugin<DR, DC> {
    public getReducer(): Reducer<ILoadingModuleWithGlobal<DR, DC>> {
      const creators: DC = this.creators;
      // map initial states
      const actions = Object.keys(creators).reduce((object, moduleName) => {
        const module = creators[moduleName as keyof DC];
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
      } as ILoadingModuleWithGlobal<DR, DC>;

      return (
        state: ILoadingModuleWithGlobal<DR, DC> = initState,
        action: AnyAction,
      ): ILoadingModuleWithGlobal<DR, DC> => {
        let newState: ILoadingModuleWithGlobal<DR, DC>;
        let module: any;
        switch (action.type) {
          case START_LOADING:
            newState = cloneDeep(state);
            newState.global = true;
            module = newState[action.moduleName as keyof ILoadingModuleWithGlobal<DR, DC>];
            module[action.actionName] = true;
            return newState;
          case END_LOADING:
            newState = cloneDeep(state);
            module = newState[action.moduleName as keyof ILoadingModuleWithGlobal<DR, DC>];
            module[action.actionName] = false;
            newState.global = Object.keys(newState).reduce<boolean>((prev, key) => {
              if (
                key !== 'global' &&
                Object.values(newState[key as keyof ILoadingModuleWithGlobal<DR, DC>]).some(
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
    }
    public *beforeEffect(record: IDefinitionObjectWithModule): Generator<any, any, any> {
      yield put({
        type: START_LOADING,
        actionName: record.name,
        moduleName: record.moduleName,
      });
    }
    public *afterEffect(record: IDefinitionObjectWithModule): Generator<any, any, any> {
      yield put({
        type: END_LOADING,
        actionName: record.name,
        moduleName: record.moduleName,
      });
    }
  };
};

export default getLoadingPlugin;
