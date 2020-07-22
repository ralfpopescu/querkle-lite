import { executeHasBatch, executeHasBatchNoParameterization, executeNoBatch } from './execute';
import { sqlTypes } from '../../../sql-types';
import { OrganizedBatchedSqls } from '../organizer';
import { Dependencies } from '../../index';

interface ExecuteOrganizedBatchedSqlsOptions<T> {
  readonly organizedBatchedSqls: OrganizedBatchedSqls<T>;
}

export const executeOrganizedBatchedSqls = (dependencies: Dependencies) => async <T>(
  { organizedBatchedSqls }: ExecuteOrganizedBatchedSqlsOptions<T>,
) => {
  const { model } = dependencies;
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
          paramTypes,
        } = hashedParamStrings[hashedParamString];

        const findBatchKey = queryString.indexOf('[BATCH]');
        if (findBatchKey === -1) {
          return executeNoBatch<T>(dependencies)({
            queryString,
            params,
            paramTypes,
            hashedQueryString,
            hashedParamString,
            batchEntity,
            batchParam,
          });
        }

        let batchString;
        const batchParamType = model[batchEntity][batchParam].type;

        if (parameterize !== true) {
          const doStringify = !(batchParamType === sqlTypes.bit
            || batchParamType === sqlTypes.bigInt
            || batchParamType === sqlTypes.int
            || batchParamType === sqlTypes.smallInt
            // @ts-ignore
            || batchParamType === sqlTypes.decimal
            || batchParamType === sqlTypes.float);

          batchString = `(${[...new Set(addToBatches
            .map(value => (doStringify ? `'${value}'` : value)))]
            .join(', ')})`;

          const newQueryString = queryString.replace('[BATCH]', batchString);

          return executeHasBatchNoParameterization<T>(dependencies)({
            queryString: newQueryString,
            params,
            paramTypes,
            hashedQueryString,
            hashedParamString,
            batchEntity,
            batchParam,
          });
        }

        const batchValues = addToBatches
          .map((addToBatch, i) => ({ [`batch${i}`]: addToBatch }))
          .reduce((acc, curr) => ({ ...acc, ...curr }));

        const batchTypes = Object
          .keys(batchValues)
          .map(key => ({ [key]: batchParamType }))
          .reduce((acc, curr) => ({ ...acc, ...curr }));

        batchString = `(${Object.keys(batchValues).map(key => `@${key}`).join(', ')})`;

        const newQueryString = queryString.replace('[BATCH]', batchString);
        return executeHasBatch<T>(dependencies)({
          queryString: newQueryString,
          params,
          batchValues,
          paramTypes,
          batchTypes,
          hashedQueryString,
          hashedParamString,
          batchEntity,
          batchParam,
        });
      });
  }).reduce((acc, curr) => ([...acc, ...curr]));

  return Promise.all(promises);
};
