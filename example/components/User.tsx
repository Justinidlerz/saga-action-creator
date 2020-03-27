import React from 'react';
import { AppState } from '../store';
import { connect } from 'react-redux';
import userSaga from '../sagas/user';

interface Props {
  loading: boolean;
  getUserById: (id: string) => void;
  throwError: VoidFunction;
  callWithArticle: VoidFunction;
}

const User = ({ loading, getUserById, throwError, callWithArticle }: Props) => {
  return (
    <div>
      <p>{loading ? 'loading' : 'loaded'}</p>
      <button onClick={() => getUserById('1')}>Get user by id</button>
      <button onClick={() => throwError()}>Throw error</button>
      <button onClick={() => callWithArticle()}>Call with article</button>
    </div>
  );
};

const mapStateToProps = (state: AppState) => ({
  loading: state.loading.user.getUserById,
});

const mapDispatchToProps = {
  getUserById: userSaga.actions.getUserById,
  throwError: userSaga.actions.throwError,
  callWithArticle: userSaga.actions.callWithArticle
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(User);
