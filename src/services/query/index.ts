import type { Pool } from 'pg';

import { handleErrors } from '../../handle-error';
import { Params } from '../../accessors/execute-sql';

type QueryOptions = {
  readonly queryString: string;
  readonly params: Params;
  readonly pool: Pool;
};

export const query = async <T = any>({
  queryString,
  params,
  pool,
}: QueryOptions) => {
  if (params) {
    return pool.query(queryString, params)
  }
  return pool.query(queryString)
};
