import { ConnectionPool } from 'mssql';
import { createPool } from './create-pool';
import { Model } from './generate-model';
import { dbStringifier, getParamTypes } from './services';
import { Translator } from './services/db-stringifier';
import { accessors } from './accessors';
import { BatchSql } from './accessors/batch-sql';
import { Get } from './accessors/get/get';
export { createPool } from './create-pool';
export { generateModel } from './generate-model';
export { sqlTypes } from './sql-types';
declare type PreparedAccessors = {
    [K in keyof typeof accessors]: ReturnType<(typeof accessors)[K]>;
};
export declare type Querkle = {
    readonly close: () => Promise<void>;
    readonly pool: ConnectionPool;
    readonly model: Model;
    readonly translator: Translator;
    readonly getParamTypes: ReturnType<typeof getParamTypes>;
    readonly stringifier: typeof dbStringifier;
    readonly createPool: typeof createPool;
    readonly get: Get;
    readonly batchSql: BatchSql;
} & PreparedAccessors;
export declare const initQuerkle: (pool: ConnectionPool, schemaName: string, model: Model, translator?: Translator) => Querkle;
