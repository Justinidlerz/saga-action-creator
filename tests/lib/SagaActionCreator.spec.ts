import SagaActionCreator from '../../src/lib/SagaActionCreator';

const createInstance = (takeType = jest.fn()) => {
  return new SagaActionCreator({
    *getActions() {},
    getActionById: {
      takeType,
      *effect() {},
    },
  });
};

describe('SagaActionCreator', () => {
  it('Should returns actions name same as passed effects', () => {
    const instance = createInstance();
    expect(Object.keys(instance.actions)).toEqual(['getActions', 'getActionById']);
  });

  it('Should returns constants name same as passed effects', () => {
    const instance = createInstance();
    expect(Object.keys(instance.constants)).toEqual(['getActions', 'getActionById']);
  });

  it('Should returns constants name same as passed effects', () => {
    const instance = createInstance();
    expect(Object.keys(instance.getRecord())).toEqual(['getActions', 'getActionById']);
  });

  it('Should returns constants name same as passed effects', () => {
    const instance = createInstance();
    const definitionObject = instance.getRecord().getActionById;
    expect(definitionObject).toMatchInlineSnapshot(`
      Object {
        "actionKey": "GET_ACTION_BY_ID_8",
        "effect": [Function],
        "name": "getActionById",
        "takeType": [MockFunction],
      }
    `);
  });

  it('Should return action creator with passed name', () => {
    const creator = SagaActionCreator.getAction('test');
    expect(creator('test', 123)).toMatchInlineSnapshot(`
      Object {
        "args": Array [
          "test",
          123,
        ],
        "type": "test",
      }
    `);
  });
});
