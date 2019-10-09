import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import creator from './sagas';

const reducers = combineReducers({
  ...creator.getReducers(),
});

export type AppState = ReturnType<typeof reducers>;

const sagaMiddleware = createSagaMiddleware();

const composeEnhancer = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(reducers, {}, composeEnhancer(applyMiddleware(sagaMiddleware)));

sagaMiddleware.run(function*() {
  yield all(creator.getEffects());
});
