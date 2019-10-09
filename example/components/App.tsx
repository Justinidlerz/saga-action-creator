import React from 'react';
import User from './User';
import { Provider } from 'react-redux';
import store from '../store';

const App = () => (
  <Provider store={store}>
    <User />
  </Provider>
);

export default App;
