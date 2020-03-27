import { call, takeLatest } from 'redux-saga/effects';

import createSagaActions from '../../build';

const article = createSagaActions({
  updateArticle: {
    takeType: takeLatest,
    *effect(): Generator<any, any, any> {
      yield new Promise((resolve) => {
        setTimeout(() => resolve(), 100);
      })
      console.log('Update article');
    },
  },
  *throwError() {
    throw new Error('Test error');
  },
});

export default article;
