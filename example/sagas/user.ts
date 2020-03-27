import { call, takeLatest, all } from 'redux-saga/effects';

import createSagaActions from '../../build';
import { getUserById, updateUser } from '../services/user';
import article from './article';

const user = createSagaActions({
  updateUser: {
    takeType: takeLatest,
    *effect(id: string, name: string): Generator<any, any, any> {
      yield call(updateUser, id, { name });
    },
  },
  *getUserById(id: string) {
    yield call(getUserById, id);
  },
  *callWithArticle(): Generator<any, any, any> {
    yield all([
      call(article.connectedEffects.throwError),
      call(article.connectedEffects.updateArticle),
    ])
  },
  *throwError() {
    throw new Error('Test error');
  },
});

export default user;
