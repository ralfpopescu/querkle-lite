import { executeSql, EntityParams, EntityParamTypes, Params, ParamTypes } from '../../../execute-sql';
import { Dependencies, StringKeys } from '../../../index';

export type BatchResult<T> = {
  readonly result: ReadonlyArray<T>;
  readonly hashedQueryString: string;
  readonly hashedParamString: string;
  readonly batchEntity: string;
  readonly batchParam: StringKeys<T>;
  readonly paramString?: string;
};

type BaseOptions<T> = {
  readonly queryString: string;
  readonly params: EntityParams<T>;
  readonly paramTypes: EntityParamTypes<T>;
  readonly hashedQueryString: string;
  readonly hashedParamString: string;
  readonly batchEntity: string;
  readonly batchParam: StringKeys<T>;
};

type HasBatchOptions<T> = BaseOptions<T> & {
  readonly batchValues: Params;
  readonly batchTypes: ParamTypes;
};

export const executeHasBatch = <T>(dependencies: Dependencies) => async ({
  queryString,
  params,
  paramTypes,
  hashedQueryString,
  hashedParamString,
  batchEntity,
  batchParam,
  batchValues,
  batchTypes,
}: HasBatchOptions<T>): Promise<BatchResult<T>> => {
  const preparedExecuteSql = executeSql(dependencies);
  const result = await preparedExecuteSql<T>({
    queryString,
    params: { ...params, ...batchValues },
    paramTypes: { ...paramTypes, ...batchTypes },
    multiple: true,
  });

  return {
    result,
    hashedQueryString,
    hashedParamString,
    batchEntity,
    batchParam,
  };
};

export const executeNoBatch = <T>(dependencies: Dependencies) => async ({
  queryString,
  params,
  paramTypes,
  hashedQueryString,
  hashedParamString,
  batchEntity,
  batchParam,
}: BaseOptions<T>): Promise<BatchResult<T>> => {
  const preparedExecuteSql = executeSql(dependencies);
  const result = await preparedExecuteSql<T>({
    queryString,
    params,
    paramTypes,
    multiple: true,
  });

  return {
    result,
    hashedQueryString,
    hashedParamString,
    batchEntity,
    batchParam,
  };
};

export const executeHasBatchNoParameterization = <T>(dependencies: Dependencies) => async ({
  queryString,
  params,
  paramTypes,
  hashedQueryString,
  hashedParamString,
  batchEntity,
  batchParam,
}: BaseOptions<T>): Promise<BatchResult<T>> => {
  const preparedExecuteSql = executeSql(dependencies);
  const result = await preparedExecuteSql<T>({
    queryString,
    params,
    paramTypes,
    multiple: true,
  });

  return {
    result,
    hashedQueryString,
    hashedParamString,
    batchEntity,
    batchParam,
  };
};
