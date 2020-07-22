import btoa from 'btoa';
import atob from 'atob';

import { EntityParams, EntityParamTypes } from '../../execute-sql';
import { StringKeys, Transform, TransformMultiple } from '../../index';
import { BatchIdentifier } from '../index';

export type SerializedBatchSql<T, R> = {
  readonly serialization: string;
  readonly paramTypes: EntityParamTypes<T>;
  readonly batchEntity: string;
  readonly batchParam: StringKeys<T>;
  readonly transform: Transform<T, R>;
  readonly transformMultiple: TransformMultiple<T, R>;
  readonly parameterize?: boolean;
};

export type DeserializedBatchSql<T, R> = {
  readonly queryString: string;
  readonly params: EntityParams<T>;
  readonly paramString?: string;
  readonly paramTypes: EntityParamTypes<T>;
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

export const generateParamSerialization = <T>(params: EntityParams<T>): string => {
  const sortedParamKeys = Object.keys(params).sort();
  const sortedObjectArray = sortedParamKeys.map(key => params[key]);

  return sortedObjectArray.reduce((acc, curr, index) => {
    const key = Object.keys(curr)[0];
    const value = curr[key];
    return encode(`${acc}${key}:${value}${index < sortedObjectArray.length ? '+' : ''}`);
  }, '');
};

export const serializeBatchSql = <T, R>({
  queryString,
  params,
  paramTypes,
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
    paramTypes,
    batchEntity,
    batchParam,
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
  let params: EntityParams<T>;
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

  const addToBatch = splitSerializedBatchSql[2] === 'none' ? null : splitSerializedBatchSql[2];
  const multiple = splitSerializedBatchSql[3] === 'yes';
  const {
    paramTypes,
    batchEntity,
    batchParam,
    transform,
    transformMultiple,
    parameterize,
  } = serializedBatchSql;

  return {
    queryString,
    params,
    paramString,
    paramTypes,
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
