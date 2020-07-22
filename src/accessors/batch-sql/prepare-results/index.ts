import { Translator } from '../../../services/db-stringifier';
import { DeserializedBatchSql } from '../serializer';
import { BatchResult } from '../executions/execute';
import { BatchIdentifier } from '../index';

interface InferParameterRenameOptions {
  readonly queryString: string;
  readonly entity: string;
  readonly param: string;
  readonly translator: Translator;
}

const inferParameterRename = ({
  queryString,
  entity,
  param,
  translator,
}: InferParameterRenameOptions) => {
  const entityRel = translator.objToRel(entity);

  const match = `${entityRel}.${param} as `.toLowerCase();
  const queryStringLowercased = queryString.toLowerCase();
  const indexOfMatch = queryStringLowercased.indexOf(match);

  if (indexOfMatch === -1) {
    return param;
  }
  const indexOfRename = indexOfMatch + match.length;
  const renamedParameter = queryString.substring(indexOfRename, queryString.length).split(' ')[0];
  const ifComma = renamedParameter.split(',')[0];
  const removeWhiteSpace = ifComma.replace(/\s/g, '');

  return translator.relToObj(removeWhiteSpace);
};

interface FindResultForBatchOptions<T, R> {
  readonly deserializedBatch: DeserializedBatchSql<T, R>;
  readonly results: ReadonlyArray<BatchResult<T>>;
  readonly inferedParameterName: keyof T;
  readonly addToBatch: BatchIdentifier;
}

const findResultForBatch = <T, R>({
  deserializedBatch,
  results,
  inferedParameterName,
  addToBatch,
}: FindResultForBatchOptions<T, R>) => {
  const resultSet = results
    .find((result) => (
      result.hashedQueryString === deserializedBatch.hashedQueryString
      && result.paramString === deserializedBatch.hashedParamString
    )).result;

  return resultSet.filter(result => `${result[inferedParameterName]}` === `${addToBatch}`);
};

interface PrepareResultsForDataLoaderOptions<T, R> {
  readonly deserializedBatchedSqls: ReadonlyArray<DeserializedBatchSql<T, R>>;
  readonly results: ReadonlyArray<BatchResult<T>>;
  readonly translator: Translator;
}

export const prepareResultsForDataLoader = <T, R>({
  deserializedBatchedSqls,
  results,
  translator,
}: PrepareResultsForDataLoaderOptions<T, R>) => deserializedBatchedSqls
  .map(deserializedBatch => {
    const {
      addToBatch,
      batchEntity,
      batchParam,
      queryString,
      multiple,
      transform,
      transformMultiple,
    } = deserializedBatch;

    const inferedParameterName = inferParameterRename({
      queryString,
      entity: batchEntity,
      param: batchParam,
      translator,
    }) as keyof T;
    const foundResult = findResultForBatch({
      deserializedBatch,
      results,
      inferedParameterName,
      addToBatch,
    });

    let result;

    if (multiple) {
      if (transformMultiple) {
        result = transformMultiple(foundResult);
        return result;
      }
      if (transform) {
        result = foundResult.map(r => transform(r));
        return result;
      }
      return foundResult;
    }

    if (transform) {
      result = transform(foundResult[0]);
      return result;
    }

    return foundResult[0];
  });

