import type { Pool as PoolType } from 'pg';
declare type PoolOptions = {
    user: string;
    host: string;
    database: string;
    password: string;
    port?: number;
};
export declare const createPool: (options?: PoolOptions) => Promise<PoolType>;
export declare const createPoolConnectionString: (conString: String) => Promise<PoolType>;
export {};
