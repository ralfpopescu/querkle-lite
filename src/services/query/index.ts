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
    console.log('queryString', queryString)
    console.log('params', params)
    const result = await pool.all(queryString, params)
    console.log('HERESARESULT', result)
    return result;
  }
  const noParamsResult = await pool.all(queryString)
  console.log('noParamsResult', noParamsResult)
  return noParamsResult
};
