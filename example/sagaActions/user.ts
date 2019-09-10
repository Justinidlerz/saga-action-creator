import { takeLatest } from 'redux-saga/effects';
import createSagaActions from '../../build';

const user = createSagaActions({
  test: {
    takeType: takeLatest,
    *effect(payload): Iterator<any> {
      yield console.log(payload)
    }
  },
  *getUsers(payload): Iterator<any> {
    yield console.log(payload)
  }
});

export default user;
