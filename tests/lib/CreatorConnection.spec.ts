import CreatorConnection from '../../src/lib/CreatorConnection';
import SagaActionCreator from '../../src/lib/SagaActionCreator';
import AbstractPlugin from '../../src/lib/AbstractPlugin';
import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import { IDefinitionClassesRecord, IDefinitionsRecord } from '../../src/typings/connection';
import createSagaMiddleware from '@redux-saga/core';
import { all } from '@redux-saga/core/effects';

interface State {
  test: string;
}
const createMockPlugin = (beforeHooks = jest.fn(), afterHooks = jest.fn()) => {
  return class MockPlugin<
    DR extends IDefinitionsRecord<DR>,
    DC extends IDefinitionClassesRecord<DR>
  > extends AbstractPlugin<DR, DC> {
    constructor(creator: any) {
      super(creator);
    }
    public getReducer(): Reducer<State> {
      const defaultReducer = super.getReducer();
      return (state: State = { test: 'test' }): State => Object.assign(state, defaultReducer({}, {} as any));
    }
    public *beforeEffect(record: any): any {
      yield super.beforeEffect(record);
      beforeHooks(record);
    }
    public *afterEffect(record: any): any {
      yield super.afterEffect(record);
      afterHooks(record);
    }
  };
};

describe('CreatorConnection', () => {
  it('Should generate effects', () => {
    const mockUser = new SagaActionCreator({
      *getUsers() {},
    });
    const mockArticle = new SagaActionCreator({
      *getArticles() {},
      getArticleById: {
        takeType: jest.fn(),
        *effect() {},
      },
    });
    const instance = new CreatorConnection({
      creators: {
        mockUser,
        mockArticle,
      },
    });
    expect(instance.getEffects().length).toBe(3);
  });

  it('Should called passed default takeType', () => {
    const mockTake = jest.fn();
    const mockArticle = new SagaActionCreator({
      *getArticles() {},
      *getArticleById() {},
    });
    const instance = new CreatorConnection({
      defaultTakeType: mockTake,
      creators: {
        mockArticle,
      },
    });
    instance.getEffects();
    expect(mockTake).toBeCalledTimes(2);
  });

  it('Should returns combined plugin reducers', () => {
    const mockArticle = new SagaActionCreator({
      *getArticles() {},
    });

    const instance = new CreatorConnection({
      creators: {
        mockArticle,
      },
      plugins: {
        test: createMockPlugin(),
      },
    });
    const store = createStore(combineReducers(instance.getReducers()));
    expect(store.getState().test).toEqual({ test: 'test' });
  });

  it('Should called hooks of plugins', () => {
    function* mockEffect() {}
    const mockArticle = new SagaActionCreator({
      getArticles: mockEffect,
    });
    const beforeHooks = jest.fn();
    const afterHooks = jest.fn();
    const instance = new CreatorConnection({
      creators: {
        mockArticle,
      },
      plugins: {
        test: createMockPlugin(beforeHooks, afterHooks),
      },
    });
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(combineReducers(instance.getReducers()), applyMiddleware(sagaMiddleware));

    sagaMiddleware.run(function*() {
      yield all(instance.getEffects());
    });

    store.dispatch(mockArticle.actions.getArticles());
    expect(beforeHooks).toBeCalledWith({
      actionKey: mockArticle.constants.getArticles,
      effect: mockEffect,
      moduleName: 'mockArticle',
      name: 'getArticles',
    });
    expect(afterHooks).toBeCalledWith({
      actionKey: mockArticle.constants.getArticles,
      effect: mockEffect,
      moduleName: 'mockArticle',
      name: 'getArticles',
    });
  });
});
