import { format, query } from '../../services';
import type { Database } from 'sqlite3'

const refetch = async <T>(generatedIds: Array<string>, entity: string, pool: Database, translator: any) => {
    console.log('CMONREFETCH')
    const inString = `(${generatedIds.join(', ')})`
    console.log('inStringinString', inString)
    const queryString = `SELECT * FROM "${translator.objToRel(entity)}" WHERE IN ${inString}`

    const response = await query({
      queryString,
      pool,
      params: null,
    });

    console.log('refetchresponse', response)
  
    return format<T>(response, translator);
}

export default refetch;
