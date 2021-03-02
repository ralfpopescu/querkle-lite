import type { Database } from 'sqlite3';
declare const refetchAlt: <T>(ids: Array<string>, entity: string, idName: string, pool: Database, translator: any) => Promise<readonly T[]>;
export default refetchAlt;
