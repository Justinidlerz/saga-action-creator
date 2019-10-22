import React from 'react';
import { AppState } from '../store';
import { connect } from 'react-redux';
import userSaga from '../sagas/user';

interface Props {
  loading: boolean;
  getUserById: (id: string) => void;
  throwError: VoidFunction;
}

const User = ({ loading, getUserById, throwError }: Props) => {
  return (
    <div>
      <p>{loading ? 'loading' : 'loaded'}</p>
      <button onClick={() => getUserById('1')}>Get user by id</button>
      <button onClick={() => throwError()}>Throw error</button>
    </div>
  );
};

const mapStateToProps = (state: AppState) => ({
  loading: state.loading.user.getUserById,
});

const mapDispatchToProps = {
  getUserById: userSaga.actions.getUserById,
  throwError: userSaga.actions.throwError,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(User);
