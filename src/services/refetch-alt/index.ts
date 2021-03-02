import { format, query } from '../../services';
import type { Database } from 'sqlite3'

const refetchAlt = async <T>(ids: Array<string>, entity: string, idName: string, pool: Database, translator: any) => {
    const inString = `(${ids.map(() => '?').join(', ')})`
    const queryString = `SELECT * FROM "${translator.objToRel(entity)}" WHERE "${translator.objToRel(idName)}" IN ${inString};`

    const response = await query({
      queryString,
      pool,
      params: ids,
    });

    return format<T>(response, translator);
}

export default refetchAlt;
