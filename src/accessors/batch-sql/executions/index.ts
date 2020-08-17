import { executeHasBatch, executeHasBatchNoParameterization, executeNoBatch } from './execute';
import { OrganizedBatchedSqls } from '../organizer';
import { Dependencies } from '../../index';

interface ExecuteOrganizedBatchedSqlsOptions<T> {
  readonly organizedBatchedSqls: OrganizedBatchedSqls<T>;
}

export const executeOrganizedBatchedSqls = (dependencies: Dependencies) => async <T>(
  { organizedBatchedSqls }: ExecuteOrganizedBatchedSqlsOptions<T>,
) => {
  console.log('organizedBatchedSqls', JSON.stringify(organizedBatchedSqls))
  const hashedQueryStrings = Object.keys(organizedBatchedSqls);

  const promises = hashedQueryStrings.map(hashedQueryString => {
    const {
      queryString,
      parameterize,
      ...hashedParamStrings
    } = organizedBatchedSqls[hashedQueryString];

    return Object
      .keys(hashedParamStrings)
      .map(hashedParamString => {
        const {
          params,
          batchEntity,
          batchParam,
          addToBatches,
        } = hashedParamStrings[hashedParamString];

        const findBatchKey = queryString.indexOf('[BATCH]');
        if (findBatchKey === -1) {
          return executeNoBatch<T>(dependencies)({
            queryString,
            params,
            hashedQueryString,
            hashedParamString,
            batchEntity,
            batchParam,
          });
        }
        console.log('addToBatches', addToBatches)
        const batchValues = [...addToBatches]
        const batchString = `(${addToBatches.map((_, i) => `$${i + 1 + (params ? params.length : 0)}`).join(', ')})`

        const newQueryString = queryString.replace('[BATCH]', batchString);

        return executeHasBatch<T>(dependencies)({
          queryString: newQueryString,
          params,
          batchValues,
          hashedQueryString,
          hashedParamString,
          batchEntity,
          batchParam,
        });
      });
  }).reduce((acc, curr) => ([...acc, ...curr]));

  return Promise.all(promises);
};
