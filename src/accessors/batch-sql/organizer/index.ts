import { decode, DeserializedBatchSql } from '../serializer';
import { StringKeys } from '../../index';

type ParamConfig<T> = {
  readonly params: Array<any> | null;
  readonly multiple: boolean;
  readonly batchEntity: string;
  readonly batchParam: StringKeys<T>;
  readonly addToBatches: ReadonlyArray<string>;
};

export type OrganizedBatchedSqls<T> = {
  readonly [hash: string]: {
    readonly queryString: string;
    readonly parameterize?: boolean;
  } & { readonly [paramString: string]: ParamConfig<T> };
}

const organizeByQueryString = <T, R>(deserializedBatchedSqls: ReadonlyArray<DeserializedBatchSql<T, R>>) => (
  deserializedBatchedSqls
    .reduce((acc, curr) => {
      const { hashedQueryString } = curr;

      if (acc[hashedQueryString]) {
        return { ...acc, [hashedQueryString]: [...acc[hashedQueryString], curr] };
      }

      return { ...acc, [hashedQueryString]: [curr] };
    }, {})
);

export const organizeBatchedSqls = <T, R>(deserializedBatchedSqls: ReadonlyArray<DeserializedBatchSql<T, R>>): OrganizedBatchedSqls<T> => {
  console.log('deserializedBatchedSqlsdeserializedBatchedSqls', JSON.stringify(deserializedBatchedSqls))
  const organizedByQueryString = organizeByQueryString(deserializedBatchedSqls);
  const queryStringKeys = Object.keys(organizedByQueryString);

  return queryStringKeys.map(qs => {
    const queryStringBatched = organizedByQueryString[qs];
    const organizedByParamString = queryStringBatched.reduce((acc, curr) => {
      const { paramString } = curr;
      if (acc[paramString]) {
        return {
          ...acc,
          [paramString]: {
            ...acc[paramString],
            addToBatches: [...acc[paramString].addToBatches, curr.addToBatch],
          },
        };
      }

      return {
        ...acc,
        queryString: decode(qs),
        parameterize: curr.parameterize,
        [paramString]: {
          params: curr.params,
          multiple: curr.multiple,
          batchEntity: curr.batchEntity,
          batchParam: curr.batchParam,
          addToBatches: [curr.addToBatch],
        },
      };
    }, {});

    return { [qs]: organizedByParamString };
  }).reduce((acc, curr) => ({ ...acc, ...curr }));
};
