import { handleErrors } from '../../handle-error';
import { Params } from '../../accessors/execute-sql';
import type { Database } from 'sqlite3'

type QueryOptions = {
  readonly queryString: string;
  params: Params;
  readonly pool: Database;
};

export const query = async <T = any>({
  queryString,
  params,
  pool,
}: QueryOptions): Promise<any> => {
  if (params) {
    const result = await pool.all(queryString, params)
    return result;
  }
  const noParamsResult = await pool.all(queryString)
  return noParamsResult
};
