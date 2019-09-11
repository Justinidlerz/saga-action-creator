import '@babel/polyfill';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { createConnection, getLoadingPlugin } from '../build';
import userSagaAction from './sagaActions/user';

const creator = createConnection({
  creators: {
    user: userSagaAction,
  },
  plugins: {
    loading: getLoadingPlugin(),
  },
});

const reducers = combineReducers({
  ...creator.getReducers(),
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(reducers, {}, applyMiddleware(sagaMiddleware));

store.subscribe(() => {
  console.log(store.getState().loading.global);
});

sagaMiddleware.run(function*() {
  yield all(creator.getEffects());
});

store.dispatch(
  userSagaAction.actions.getUsers({
    id: 123,
  }),
);
