import { format, query } from '../../services';
import type { Database } from 'sqlite3'

const refetch = async <T>(generatedIds: Array<string>, entity: string, pool: Database, translator: any) => {
    const inString = `(${generatedIds.map(() => '?').join(', ')})`
    const queryString = `SELECT * FROM "${translator.objToRel(entity)}" WHERE id IN ${inString};`
    console.log('requeryString', queryString)

    const response = await query({
      queryString,
      pool,
      params: generatedIds,
    });

    console.log('refetchresponse -', queryString, "---", response)
  
    return format<T>(response, translator);
}

export default refetch;
