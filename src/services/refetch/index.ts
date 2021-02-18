import { format, query } from '../../services';
import type { Database } from 'sqlite3'

const refetch = async <T>(entity: string, pool: Database, translator: any) => {
    const id = await pool.get(`SELECT last_insert_rowid()`);

    console.log('refetchid', id)

    if(!id) {
      return []
    }
  
    const fetchQueryString = `
    SELECT * FROM "${translator.objToRel(entity)}" WHERE id = ${id};
    `
    const response = await query({
      queryString: fetchQueryString,
      pool,
      params: null,
    });
  
    return format<T>(response, translator)[0];
}

export default refetch;
