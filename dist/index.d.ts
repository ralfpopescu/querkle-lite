/// <reference types="./vendor-typings/sqlite3" />
import type { Database } from "sqlite3";
import { Translator } from "./services/db-stringifier";
import { accessors } from "./accessors";
import { BatchSql } from "./accessors/batch-sql";
import { Get } from "./accessors/get/get";
declare type PreparedAccessors = {
    [K in keyof typeof accessors]: ReturnType<typeof accessors[K]>;
};
export declare type Querkle = {
    readonly close: () => Promise<void>;
    readonly pool: Database;
    readonly translator: Translator;
    readonly get: Get;
    readonly batchSql: BatchSql;
} & PreparedAccessors;
export declare const initQuerkle: (pool: Database, translator?: Translator) => Querkle;
export {};
