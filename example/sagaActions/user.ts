import { takeLatest } from 'redux-saga/effects';
import createSagaAction from '../../build';

const user = createSagaAction({
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
