import { deserializeBatchSql, serializeBatchSql, SerializedBatchSql } from './serializer';
import { executeOrganizedBatchedSqls } from './executions';
import { prepareResultsForDataLoader } from './prepare-results';
import { organizeBatchedSqls } from './organizer';
import { Dependencies, Transform, TransformMultiple } from '../index';
import DataLoader from 'dataloader';

export type BatchIdentifier = string | number;

type BaseOptions<T> = {
  readonly queryString: string;
  readonly parameterize?: boolean;
  readonly addToBatch?: BatchIdentifier;
  readonly batchEntity?: string;
  readonly batchParam?: keyof T;
  readonly params?: Array<any>;
};

type OptionsSingle<T> = BaseOptions<T> & {
  readonly multiple?: false;
};

type OptionsSingleTransform<T, R, F extends Transform<T, R>> = BaseOptions<T> & {
  readonly multiple?: false;
  readonly transform: F;
};

type OptionsMultiple<T> = BaseOptions<T> & {
  readonly multiple: true;
};

type OptionsMultipleTransform<T, R, F extends Transform<T, R>> = BaseOptions<T> & {
  readonly multiple: true;
  readonly transform: F;
};

type OptionsMultipleTransformMultiple<T, R, F extends TransformMultiple<T, R>> = BaseOptions<T> & {
  readonly multiple: true;
  readonly transformMultiple: F;
};

type BatchSqlOptions<T, R, F> =
  OptionsSingle<T> |
  OptionsSingleTransform<T, R, F extends Transform<T, R> ? F : never> |
  OptionsMultiple<T> |
  OptionsMultipleTransform<T, R, F extends Transform<T, R> ? F : never> |
  OptionsMultipleTransformMultiple<T, R, F extends TransformMultiple<T, R> ? F : never>;

export type BatchSql = {
  <T = any, R = never, F = never>(options: OptionsSingle<T>): Promise<T>;
  <T = any, R = any, F extends Transform<T, R> = Transform<T, R>>(options: OptionsSingleTransform<T, R, F>): Promise<R>;
  <T = any, R = never, F = never>(options: OptionsMultiple<T>): Promise<Array<T>>;
  <T = any, R = any, F extends Transform<T, R> = Transform<T, R>>(options: OptionsMultipleTransform<T, R, F>): Promise<Array<R>>;
  <T = any, R = any, F extends TransformMultiple<T, R> = TransformMultiple<T, R>>(options: OptionsMultipleTransformMultiple<T, R, F>): Promise<R>;
};

export const batchSqlFunction = <T, R>(dependencies: Dependencies) => async (batchedSqls: Array<SerializedBatchSql<T, R>>) => {
  const { translator } = dependencies;
  const deserializedBatchedSqls = batchedSqls.map(b => deserializeBatchSql(b));
  const organizedBatchedSqls = organizeBatchedSqls(deserializedBatchedSqls);

  const preparedExecute = executeOrganizedBatchedSqls(dependencies);
  const results = await preparedExecute({ organizedBatchedSqls });

  return prepareResultsForDataLoader({
    deserializedBatchedSqls,
    results,
    translator,
  });
};

export const batchSql = <T = any,  R = any, F = any>(
  batchDataLoader: DataLoader<SerializedBatchSql<T, R>, any>,
): BatchSql => async (
  options
) => {
  const {
    queryString,
    params,
    addToBatch,
    batchEntity,
    batchParam,
    ...rest
  } = options;

  if (addToBatch && (batchEntity == null || batchParam == null)) {
    throw new Error(`Added to batch but did not specify batch entity or batch param. Query string: ${queryString}`);
  }

  if ('transform' in options && typeof options.transform !== 'function') {
    throw new Error('transform parameter is not a function.');
  }

  if ('transformMultiple' in options) {
    if (typeof options.transformMultiple !== 'function') {
      throw new Error('transformMultiple parameter is not a function.');
    }

    if (!('multiple' in options) || ('multiple' in options && !options.multiple)) {
      throw new Error('multiple needs to be set to true to use transformMultiple.');
    }
  }

  return batchDataLoader.load(serializeBatchSql({
    queryString,
    params,
    addToBatch,
    batchEntity,
    batchParam,
    ...rest,
  }));
};
