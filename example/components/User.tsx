import React from 'react';
import { AppState } from '../store';
import { connect } from 'react-redux';
import userSaga from '../sagas/user';

interface Props {
  loading: boolean;
  getUserById: (id: string) => void;
}

const User = ({ loading, getUserById }: Props) => {
  return (
    <div>
      <p>{loading ? 'loading' : 'loaded'}</p>
      <button onClick={() => getUserById('1')}>Get user by id</button>
    </div>
  );
};

const mapStateToProps = (state: AppState) => ({
  loading: state.loading.user.getUserById,
});

const mapDispatchToProps = {
  getUserById: userSaga.actions.getUserById,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(User);
