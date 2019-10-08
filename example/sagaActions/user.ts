import { takeLatest } from 'redux-saga/effects';
import createSagaActions from '../../build';

const user = createSagaActions({
  test: {
    takeType: takeLatest,
    *effect(id: number, name: string) {
      yield console.log(id, name);
    },
  },
  *getUser(id: string) {},
});

export default user;

// user.actions.test()
