import '@babel/polyfill';
import { createConnection, getLoadingPlugin } from '../build';
import userSagaAction from './sagaActions/user';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';

const creator = createConnection({
  creators: {
    user: userSagaAction,
  },
  plugins: [getLoadingPlugin()],
});

const reducers = combineReducers({
  ...creator.getReducers(),
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(reducers, {}, applyMiddleware(sagaMiddleware));

store.subscribe(() => {
  console.log(store.getState());
});

sagaMiddleware.run(function*() {
  yield all(creator.getEffects());
});

store.dispatch(
  userSagaAction.actions.getUsers({
    id: 123,
  }),
);
