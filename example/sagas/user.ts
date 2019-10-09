import { call, takeLatest } from 'redux-saga/effects';

import createSagaActions from '../../build';
import { getUserById, updateUser } from '../services/user';

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
});

export default user;
