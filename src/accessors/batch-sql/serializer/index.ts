import btoa from 'btoa';
import atob from 'atob';

import { StringKeys, Transform, TransformMultiple } from '../../index';
import { BatchIdentifier } from '../index';
import { any } from 'expect';

export type SerializedBatchSql<T, R> = {
  readonly serialization: string;
  readonly batchEntity: string;
  readonly addToBatch: any;
  readonly multiple?: boolean;
  readonly batchParam: StringKeys<T>;
  readonly transform: Transform<T, R>;
  readonly transformMultiple: TransformMultiple<T, R>;
  readonly parameterize?: boolean;
};

export type DeserializedBatchSql<T, R> = {
  readonly queryString: string;
  readonly params: Array<any>;
  readonly paramString?: string;
  readonly batchEntity: string;
  readonly batchParam: StringKeys<T>;
  readonly addToBatch: BatchIdentifier;
  readonly parameterize: boolean;
  readonly hashedQueryString?: string;
  readonly hashedParamString?: string;
  readonly multiple?: boolean;
  readonly transform?: Transform<T, R>;
  readonly transformMultiple?: TransformMultiple<T, R>;
};

export const encode = str => btoa(str);
export const decode = str => atob(str);

export const generateParamSerialization = <T>(params: Array<any>): string => {
  return params.join('&')
};

export const serializeBatchSql = <T, R>({
  queryString,
  params,
  addToBatch,
  batchEntity,
  batchParam,
  multiple,
  transform,
  transformMultiple,
  parameterize,
}: DeserializedBatchSql<T, R>): SerializedBatchSql<T, R> => {
  let paramString = 'none';
  if (params && Object.keys(params).length > 0) {
    paramString = generateParamSerialization(params);
  }

  const queryHash = encode(queryString);
  const serialization = `${queryHash}-${paramString}-${addToBatch != null ? addToBatch : 'none'}-${multiple ? 'yes' : 'no'}`;

  return {
    serialization,
    batchEntity,
    addToBatch,
    batchParam,
    multiple,
    transform,
    transformMultiple,
    parameterize,
  };
};

export const deserializeBatchSql = <T, R>(serializedBatchSql: SerializedBatchSql<T, R>): DeserializedBatchSql<T, R> => {
  const splitSerializedBatchSql = serializedBatchSql.serialization.split('-');

  const hashedQueryString = splitSerializedBatchSql[0];
  const queryString = decode(hashedQueryString);

  const paramString = splitSerializedBatchSql[1];
  let params: Array<any>;
  if (paramString === 'none') {
    params = null;
  } else {
    const decodedParamString = decode(paramString);
    const splitParams = decodedParamString.split('+');
    params = splitParams
      .map(param => {
        const splitParam = param.split(':');
        return { [splitParam[0]]: splitParam[1] };
      })
      .reduce((acc, curr) => ({ ...acc, ...curr }));
  }

  const {
    batchEntity,
    batchParam,
    addToBatch,
    multiple,
    transform,
    transformMultiple,
    parameterize,
  } = serializedBatchSql;

  return {
    queryString,
    params,
    paramString,
    batchEntity,
    batchParam,
    addToBatch,
    multiple,
    transform,
    transformMultiple,
    parameterize,
    hashedQueryString,
  };
};
