import { cloneDeep } from 'lodash';
import getLoadingPlugin from '../../src/plugins/loading';
import SagaActionCreator from '../../src/lib/SagaActionCreator';
import CreatorConnection from '../../src/lib/CreatorConnection';
import createSagaMiddleware from '@redux-saga/core';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { all } from '@redux-saga/core/effects';

const sleep = (time = 300) => new Promise(resolve => setTimeout(resolve, time));

describe('Loading plugin', () => {
  it('Should returns the reducer with creators structure', done => {
    const testActions = new SagaActionCreator({
      *testEffect() {
        yield sleep(300);
      },
      *testEffect1() {
        yield sleep();
      },
    });
    const instance = new CreatorConnection({
      creators: {
        test: testActions,
      },
      plugins: {
        loading: getLoadingPlugin(),
      },
    });

    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(combineReducers(instance.getReducers()), applyMiddleware(sagaMiddleware));

    sagaMiddleware.run(function*() {
      yield all(instance.getEffects());
    });

    const states: any[] = [];
    store.subscribe(() => {
      states.push(cloneDeep(store.getState().loading));
      if (states.length === 6) {
        expect(states[0]).toEqual({ global: false, test: { testEffect: false, testEffect1: false } });
        expect(states[1]).toEqual({ global: true, test: { testEffect: true, testEffect1: false } });
        expect(states[2]).toEqual({ global: true, test: { testEffect: true, testEffect1: false } });
        expect(states[3]).toEqual({ global: true, test: { testEffect: true, testEffect1: true } });
        expect(states[4]).toEqual({ global: true, test: { testEffect: false, testEffect1: true } });
        expect(states[5]).toEqual({ global: false, test: { testEffect: false, testEffect1: false } });
        done();
      }
    });
    store.dispatch(testActions.actions.testEffect());
    store.dispatch(testActions.actions.testEffect1());
  });
});
