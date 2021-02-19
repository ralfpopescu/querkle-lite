/// <reference types="./vendor-typings/sqlite3" />
import type { Database } from 'sqlite3';
import { Translator } from '../services/db-stringifier';
export { get, getBatchFunction } from './get';
export { batchSql, batchSqlFunction } from './batch-sql';
export declare type IsValue = string | number;
export declare type ExcludeGeneratedColumns<T> = Omit<T, 'id' | 'udpatedAt' | 'createdAt'>;
export declare type StringKeys<T> = Extract<keyof T, string>;
export declare type Transform<T, R> = (record: T) => R;
export declare type TransformMultiple<T, R> = (records: ReadonlyArray<T>) => R;
export declare type Dependencies = {
    readonly pool: Database;
    readonly translator: Translator;
};
export declare type Accessor<O, R> = (options: O) => R;
export declare const accessors: {
    getAll: ({ pool, translator, }: Dependencies) => <T>({ entity }: {
        readonly entity: string;
    }) => Promise<readonly T[]>;
    getMultiple: ({ pool, translator, }: Dependencies) => <T_1>({ entity, where, isIn, }: {
        readonly entity: string;
        readonly where: Extract<keyof T_1, string>;
        readonly isIn: (string | number)[];
        readonly parameterize?: boolean;
    }) => Promise<readonly T_1[]>;
    executeSql: ({ pool, translator, }: {
        pool: any;
        translator: any;
    }) => {
        <T_2>(options: {
            readonly queryString: string;
            readonly params?: import("./execute-sql").Params;
        } & {
            readonly multiple?: false;
        }): Promise<T_2>;
        <T_3>(options: {
            readonly queryString: string;
            readonly params?: import("./execute-sql").Params;
        } & {
            readonly multiple: true;
        }): Promise<readonly T_3[]>;
    };
    insert: ({ pool, translator, }: Dependencies) => <T_4>({ entity, input }: {
        readonly entity: string;
        readonly input: Pick<T_4, Exclude<keyof T_4, "id" | "udpatedAt" | "createdAt">>;
    }) => Promise<any>;
    insertMany: ({ pool, translator, }: Dependencies) => <T_5>({ entity, inputArray, }: {
        readonly entity: string;
        readonly inputArray: readonly Partial<Pick<T_5, Exclude<keyof T_5, "id" | "udpatedAt" | "createdAt">>>[];
    }) => Promise<readonly T_5[]>;
    remove: ({ pool, translator, }: Dependencies) => {
        <T_6>(options: {
            readonly entity: string;
            readonly where: Extract<keyof T_6, string>;
            readonly is: string | number;
        } & {
            readonly multiple?: false;
        }): Promise<T_6 & {
            readonly quantity: number;
        }>;
        <T_7>(options: {
            readonly entity: string;
            readonly where: Extract<keyof T_7, string>;
            readonly is: string | number;
        } & {
            readonly multiple: true;
        }): Promise<readonly (T_7 & {
            readonly quantity: number;
        })[]>;
    };
    update: ({ pool, translator, }: Dependencies) => {
        <T_8>(options: {
            readonly entity: string;
            readonly input: Partial<Pick<T_8, Exclude<keyof T_8, "id" | "udpatedAt" | "createdAt">>>;
            readonly where: Extract<keyof T_8, string>;
            readonly is: string | number;
            readonly multiple?: boolean;
        } & {
            readonly multiple?: false;
        }): Promise<T_8>;
        <T_9>(options: {
            readonly entity: string;
            readonly input: Partial<Pick<T_9, Exclude<keyof T_9, "id" | "udpatedAt" | "createdAt">>>;
            readonly where: Extract<keyof T_9, string>;
            readonly is: string | number;
            readonly multiple?: boolean;
        } & {
            readonly multiple: true;
        }): Promise<readonly T_9[]>;
    };
};
