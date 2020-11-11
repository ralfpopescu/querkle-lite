import type { Pool } from 'pg';
import { createPool } from './create-pool';
import { Translator } from './services/db-stringifier';
import { accessors } from './accessors';
import { BatchSql } from './accessors/batch-sql';
import { Get } from './accessors/get/get';
export { createPool } from './create-pool';
declare type PreparedAccessors = {
    [K in keyof typeof accessors]: ReturnType<(typeof accessors)[K]>;
};
export declare type Querkle = {
    readonly close: () => Promise<void>;
    readonly pool: Pool;
    readonly translator: Translator;
    readonly createPool: typeof createPool;
    readonly get: Get;
    readonly batchSql: BatchSql;
} & PreparedAccessors;
export declare const initQuerkle: (pool: Pool, translator?: Translator) => Querkle;
