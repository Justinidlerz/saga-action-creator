import { createConnection, getLoadingPlugin, getErrorHandlePlugin } from '../../build';
import userSagaAction from './user';
import { takeEvery } from 'redux-saga/effects';

const creator = createConnection({
  defaultTakeType: takeEvery,
  creators: {
    user: userSagaAction,
  },
  plugins: {
    error: getErrorHandlePlugin((error, details) => {
      console.log(error, details);
    }),
    loading: getLoadingPlugin(),
  },
});

export default creator;
