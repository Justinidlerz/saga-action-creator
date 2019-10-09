import { createConnection, getLoadingPlugin } from '../../build';
import userSagaAction from './user';
import { takeEvery } from 'redux-saga/effects';

const creator = createConnection({
  defaultTakeType: takeEvery,
  creators: {
    user: userSagaAction,
  },
  plugins: {
    loading: getLoadingPlugin(),
  },
});

export default creator;
