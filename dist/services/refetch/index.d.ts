import type { Database } from 'sqlite3';
declare const refetch: <T>(generatedIds: Array<string>, entity: string, pool: Database, translator: any) => Promise<readonly T[]>;
export default refetch;
