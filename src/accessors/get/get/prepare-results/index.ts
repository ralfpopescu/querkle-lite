import { GetBatchedResult } from '../executions';
import { SerializedGet } from '../serializer';

export type PreparedResult = object;

type ProcessedResults = {
  [entity: string]: {
    [key: string]: object;
  };
};

type KeyedResults<T> = {
  readonly keyBy: keyof T;
} & { [key: string]: any };

const keyResultsByValue = <T>(results: ReadonlyArray<T>, keyBy: any) => {
  const keyedResults: KeyedResults<T> = { keyBy };

  for (const result of results) {
    const keyValue = result[keyBy];
    const existing = keyedResults[keyValue] || [];

    keyedResults[keyValue] = [...existing, result];
  }

  return keyedResults;
};

const processAllResults = <T>(allResults: ReadonlyArray<GetBatchedResult<T>>): ProcessedResults => allResults
  .reduce((acc, curr) => {
    const { entity, key, results } = curr;
    const keyedResults = keyResultsByValue(results, key);
    acc[entity] = { [key]: keyedResults };
    return acc;
  }, {});

const findResultForGet = (get: SerializedGet, processedResults: ProcessedResults) => {
  const { entity, where, is } = get;
  return processedResults[entity][where][is];
};

export const prepareResults = <T>(gets: ReadonlyArray<SerializedGet>, allResults: ReadonlyArray<GetBatchedResult<T>>): ReadonlyArray<PreparedResult> => {
  const processedResults = processAllResults(allResults);

  return gets
    .map(g => findResultForGet(g, processedResults))
    .map((gResult, i) => {
      const get = gets[i];
      const {
        returnField,
        multiple,
        transform,
        transformMultiple,
      } = get;

      if (gResult == null) {
        if (transform) {
          if (multiple) {
            return gResult.map(() => transform(null));
          }
          return transform(null);
        }
        if (multiple) {
          if (transformMultiple) {
            return transformMultiple([]);
          }
          return [];
        }
        return null;
      }

      if (returnField) {
        const returnFields = gResult.map(result => result[returnField]);
        return multiple ? returnFields : returnFields[0];
      }
      if (transform) {
        if (multiple) {
          return gResult.map(result => transform(result));
        }
        return transform(gResult[0]);
      }
      if (transformMultiple) {
        return transformMultiple(gResult);
      }
      return multiple ? gResult : gResult[0];
    });
};
