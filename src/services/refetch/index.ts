import { format, query } from '../../services';
import type { Database } from 'sqlite3'

const refetch = async <T>(generatedIds: Array<string>, entity: string, pool: Database, translator: any) => {
    console.log('CMONREFETCH')
    const inString = `(${generatedIds.map(id => `'${id}'`).join(', ')})`
    console.log('inStringinString', inString)
    const queryString = `SELECT * FROM "${translator.objToRel(entity)}" WHERE id IN ${inString}`
    console.log('requeryString', queryString)

    const response = await query({
      queryString,
      pool,
      params: null,
    });

    console.log('refetchresponse', response)
  
    return format<T>(response, translator);
}

export default refetch;
