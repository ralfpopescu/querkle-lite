import { format, query } from '../../services';
import type { Database } from 'sqlite3'

const refetch = async <T>(generatedIds: Array<string>, entity: string, pool: Database, translator: any) => {
    const inString = `(${generatedIds.map(() => '?').join(', ')})`
    const queryString = `SELECT * FROM "${translator.objToRel(entity)}" WHERE id IN ${inString};`

    const response = await query({
      queryString,
      pool,
      params: generatedIds,
    });

    return format<T>(response, translator);
}

export default refetch;
