import { createConnection, getLoadingPlugin, getErrorHandlePlugin } from '../../build';
import { takeEvery } from 'redux-saga/effects';
import user from './user';
import article from './article';

const creator = createConnection({
  defaultTakeType: takeEvery,
  creators: {
    user,
    article,
  },
  plugins: {
    error: getErrorHandlePlugin(function* (error, details) {
      console.log(error, details);
    }),
    loading: getLoadingPlugin(),
  },
});

export default creator;
