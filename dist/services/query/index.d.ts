import type { Pool } from 'pg';
import { Params } from '../../accessors/execute-sql';
declare type QueryOptions = {
    readonly queryString: string;
    readonly params: Params;
    readonly pool: Pool;
};
export declare const query: <T = any>({ queryString, params, pool, }: QueryOptions) => Promise<import("pg").QueryResult<any>>;
export {};
