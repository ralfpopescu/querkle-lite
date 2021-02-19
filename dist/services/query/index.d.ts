/// <reference types="./vendor-typings/sqlite3" />
import { Params } from '../../accessors/execute-sql';
import type { Database } from 'sqlite3';
declare type QueryOptions = {
    readonly queryString: string;
    params: Params;
    readonly pool: Database;
};
export declare const query: <T = any>({ queryString, params, pool, }: QueryOptions) => Promise<any>;
export {};
