import createSagaActions, { createConnection } from '../src';
import SagaActionCreator from '../src/lib/SagaActionCreator';
import CreatorConnection from '../src/lib/CreatorConnection';

describe('createSagaActions', () => {
  it('Should return SagaActionCreator instance', () => {
    const instance = createSagaActions({});
    expect(instance).toBeInstanceOf(SagaActionCreator);
  });
});

describe('createConnection', () => {
  it('Should return CreatorConnection instance', () => {
    const instance = createConnection({
      creators: {},
    });
    expect(instance).toBeInstanceOf(CreatorConnection);
  });
});
