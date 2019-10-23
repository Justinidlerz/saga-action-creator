import { call } from 'redux-saga/effects';
import AbstractPlugin from '../lib/AbstractPlugin';
import { IDefinitionClassesRecord, IDefinitionsRecord } from '../typings/connection';
import { IDefinitionObjectWithModule } from '../typings/creator';

type IErrorHandle = (error: Error, details: IDefinitionObjectWithModule) => Generator<any, any, any>;

const getErrorHandlePlugin = (errorHandle: IErrorHandle) => {
  return class ErrorHandle<
    DR extends IDefinitionsRecord<DR>,
    DC extends IDefinitionClassesRecord<DR>
  > extends AbstractPlugin<DR, DC> {
    public *errorHandle(error: Error, details: IDefinitionObjectWithModule): Generator<any, boolean, any> {
      yield call(errorHandle, error, details);
      return true;
    }
  };
};

export default getErrorHandlePlugin;
