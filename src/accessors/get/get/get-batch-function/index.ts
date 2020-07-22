import { BatchLoadFn } from 'dataloader';

import { organizer } from '../organizer';
import { executeGets } from '../executions';
import { PreparedResult, prepareResults } from '../prepare-results';
import { Dependencies, IsValue, StringKeys } from '../../../index';
import { SerializedGet } from '../serializer';

type KeyValues<T> = {
  readonly key: StringKeys<T>;
  readonly values: ReadonlyArray<IsValue>;
};

export type GetByEntity<T> = {
  readonly entity: string;
  readonly keyValues: ReadonlyArray<KeyValues<T>>;
};

export const getBatchFunction = (dependencies: Dependencies): BatchLoadFn<SerializedGet, PreparedResult> => async (gets: ReadonlyArray<SerializedGet>) => {
  const getsByEntity = organizer(gets);
  const allResults = await executeGets(dependencies)(getsByEntity);

  return prepareResults(gets, allResults);
};
