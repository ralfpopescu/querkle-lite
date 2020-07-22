import sql, { ConnectionPool } from 'mssql';

import { handleErrors } from '../../handle-error';
import { Params, ParamTypes } from '../../accessors/execute-sql';

type QueryOptions = {
  readonly queryString: string;
  readonly params: Params;
  readonly paramTypes: ParamTypes;
  readonly pool: ConnectionPool;
};

export const query = async <T = any>({
  queryString,
  params,
  paramTypes,
  pool,
}: QueryOptions) => {
  const ps = new sql.PreparedStatement(pool);

  if (params) {
    Object
      .keys(params)
      .map(key => {
        if (!paramTypes[key]) {
          throw new Error(`Param type for ${key} was not provided.`);
        }

      return ps.input(key, paramTypes[key]);
    });
  }

  let execute;
  let prepare;

  try {
    prepare = await ps.prepare(queryString);
  } catch (e) {
    throw new Error(`Error preparing statement: ${JSON.stringify(e.message)}: ${JSON.stringify(prepare)}`);
  }

  try {
    execute = await ps.execute(params);
  } catch (e) {
    throw new Error(`Error executing statement: ${JSON.stringify(e.message)}: ${JSON.stringify(execute)}`);
  }

  try {
    await ps.unprepare();
  } catch (e) {
    throw new Error('Error unpreparing statement: ');
  }

  return handleErrors<T>(execute);
};
