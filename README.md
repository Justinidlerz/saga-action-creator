# Saga action creator

[![npm version](https://badge.fury.io/js/saga-action-creator.svg)](https://badge.fury.io/js/saga-action-creator)
[![codecov](https://codecov.io/gh/Justinidlerz/saga-action-creator/branch/master/graph/badge.svg)](https://codecov.io/gh/Justinidlerz/saga-action-creator)
[![npm](https://img.shields.io/npm/dm/saga-action-creator.svg)](https://www.npmjs.com/package/saga-action-creator)
[![Build Status](https://travis-ci.org/Justinidlerz/saga-action-creator.svg?branch=master)](https://travis-ci.org/Justinidlerz/saga-action-creator)
[![TypeScript](https://img.shields.io/badge/%3C/%3E-TypeScript-0072C4.svg)](https://www.typescriptlang.org/)
[![Tested with Jest](https://img.shields.io/badge/tested_with-Jest-99424f.svg)](https://github.com/facebook/jest)
[![MIT License](https://img.shields.io/npm/l/generator-bxd-oss.svg)](#License)

The `Saga-action-creator` is made to simplify the writing of [`Redux-saga`](https://github.com/redux-saga/redux-saga), it can auto-generate `Action Creators` for dispatch from your writes Saga effects directly.

This toolkit supports plugins and It can help to make some actions before and after effect convenient, which means it will be much simpler to set up the loading state, handle the error, etc. when you executing the asynchronous effect.

Adds automated loading indicators for effects to `Saga-action-creator`. Inspired by [`Rematch`](https://github.com/rematch/rematch).

Why we still need this toolkit when we have [`rematch`](https://github.com/rematch/rematch) already? That is because the cost of migration from Redux's historical project to Rematch is high, and Redux-Saga has many excellent designs (i.e: such as take, fork, channel, etc.).

# Features

- Auto-generate actions from passed effect
- Completely retain redux-saga features
- Support plugins
- Typescript-typings support (including plugins)
- Testable

# Getting started

## Install

```sh
$ npm install --save saga-action-creator
```

or

```sh
$ yarn add saga-action-creator
```

## Usage Example

#### Step 1: Define saga effects

```typescript
import createSagaActions from 'saga-action-creator';
import { takeLatest, call } from 'redux-saga/effects';
import { getUserInfo, updateUser } from '../services/user';

const user = createSagaActions({
  // By default, you can pass the generator functions
  *getUserById(id: string): Generator<any, any, any> {
    yield call(getUserInfo, id);
  },
  // If you need to change the effect take type
  // you can pass the object for the action name
  updateUser: {
    takeType: takeLatest,
    *effect(id: string, name: string): Generator<any, any, any> {
      yield call(updateUser, id, { name });
    },
  },
});

export default user;
```

#### Step 2: Connect sagaActions

```typescript
import { createConnection, getLoadingPlugin } from 'saga-action-creator';
import user from './user';
import { takeLatest } from 'redux-saga/effects';

const creator = createConnection({
  // Combine creators
  creators: {
    user,
  },
  // You can change the default take type here,
  // by default is `takeEvery`
  defaultTakeType: takeLatest,
  // You can pass plugins at there
  plugins: {
    // the plugin name will be map to reducer key
    loading: getLoadingPlugin(),
  },
});

export default creator;
```

For a more advanced setup, see [plugins]() and [Redux-saga](https://redux-saga.js.org/docs/api/)

#### Step 3: Connect to redux and redux-saga

```typescript
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { all } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import creator from '../sagas';

// connect to store
const reducers = combineReducers({
  ...creator.getReducers(),
});

const sagaMiddleware = createSagaMiddleware();

// connect to saga and run
sagaMiddleware.run(function*() {
  yield all(creator.getEffects());
});

const store = createStore(reducers, applyMiddleware(sagaMiddleware));

export type AppState = ReturnType<typeof reducers>;

export default store;
```

#### Step 3: Use created actions

```typescript
import { connect } from 'react-redux';
import { AppState } from '../store';
import userActions from '../sagaActions/user';
import UserList from './UserList';

const mapStateToProps = (state: AppState) => ({
  loading: state.loading.user.getUserById,
});

const mapDispatchToProps = {
  getUserById: userActions.actions.getUserById,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserList);
```

# Examples

- [Todos]()

# TODOs

- [x] Typescript generic types for plugins export reducer
- [x] Code remarks
- [x] Unit tests
- [x] Local example
- [ ] Plugin docs
- [ ] Online examples
- [ ] API docs
- [ ] Chinese docs

# API

See the [APIs]()

## License

For a detailed explanation on how things work,
checkout the [rollup doc](https://https://rollupjs.org/guide/en) and [parcel](https://parceljs.org/)

Copyright (c) 2019-present, Idler.zhu
