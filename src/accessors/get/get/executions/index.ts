import { Dependencies, IsValue, StringKeys } from '../../../index';
import { getMultiple } from '../../get-multiple';
import { GetByEntity } from '../get-batch-function';

type GetBatchedOptions<T> = {
  readonly entity: string;
  readonly where: StringKeys<T>;
  readonly isIn: ReadonlyArray<IsValue>;
};

export type GetBatchedResult<T> = {
  readonly entity: string;
  readonly key: StringKeys<T>;
  readonly results: ReadonlyArray<T>;
}

const flatten = <T>(arr: ReadonlyArray<ReadonlyArray<T>>) => arr.reduce((acc, curr) => [...acc, ...curr], []);

const getBatched = (depedencies: Dependencies) => async <T>({ entity, where, isIn }: GetBatchedOptions<T>): Promise<GetBatchedResult<T>> => {
  const isIntSet = [...new Set(isIn)];

  if (isIntSet.length > 2100) {
    throw new Error(`Batching huge number of gets: ${isIntSet.length}. Reduce query size.`);
  }
  const results = await getMultiple(depedencies)<T>({ entity, where, isIn: isIntSet });

  return { entity, key: (where as StringKeys<T>), results };
};

export const executeGets = <T>(dependencies: Dependencies) => (getsByEntity: ReadonlyArray<GetByEntity<T>>) => {
  const batchedGets = getsByEntity
    .map(({ entity, keyValues }) => (
      keyValues.map(async ({ key, values }) => getBatched(dependencies)({
        entity,
        where: key,
        isIn: values,
      }))
    ));


  return Promise.all(flatten(batchedGets));
};
