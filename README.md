# Saga action creator

# Usage

## Create saga actions
### Define the sagas
```typescript
import createSagaActions from 'saga-action-creator';
import { takeLatest } from 'redux-saga/effects';

const user = createSagaActions({
  // If you need to change the effect take type
  // you can pass the object for the action name
  test: {
    takeType: takeLatest,
    *effect(payload): Iterator<any> {
      yield console.log(payload)
    }
  },
  // by default, you can pass the generator function for the action
  *getUsers(payload): Iterator<any> {
    yield console.log(payload)
  }
});

export default user;
```
### Connect sagaActions and use the plugin
```typescript
import { createConnection, getLoadingPlugin } from 'saga-action-creator';
import user from './sagaActions/user';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { takeEvery } from 'redux-saga/effects';

// combine creators an use plugin
const creator = createConnection({
  creators: {
    user,
  },
  // you can change the default take type here, by default is `takeEvery`
  defaultTakeType: takeEvery,
  plugins: [getLoadingPlugin()],
});

// connect to store
const reducers = combineReducers({
  ...creator.getReducers(),
});

const sagaMiddleware = createSagaMiddleware();
// connect to saga
sagaMiddleware.run(function *() {
  yield all(creator.getEffects());
});

const store = createStore(reducers, {}, applyMiddleware(sagaMiddleware));

export default store;
```

### Use the actions
```typescript
import { connect } from 'react-redux';
import userActions from '../sagaActions/user';
import UserList from './UserList';

const mapStateToProps = (state) => ({
  loading: state.loading.user.getUsers
});

const mapDispatchToProps = {
    getUsers: userActions.actions.getUsers,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserList)
```

# Development
```javascript
npm start                                             # Develop
npm run test                                          # Test
npm publish                                           # Deploy
```

# TODOs
- [ ] Typescript generic types for plugins export reducer   
- [ ] Plugin docs
- [ ] Code remarks
- [ ] Unit tests

## License
For a detailed explanation on how things work,
checkout the [rollup doc](https://https://rollupjs.org/guide/en) and [parcel](https://parceljs.org/)

Copyright (c) 2019-present, Idler.zhu
