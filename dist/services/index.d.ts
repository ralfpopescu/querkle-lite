import type { QueryResult } from 'pg';
import { Translator } from './db-stringifier';
export { query } from './query';
export * as dbStringifier from './db-stringifier';
export declare const format: <T>(recordset: QueryResult<any>, translator: Translator) => readonly T[];
export declare const stringifyGet: ({ entity, where, is, multiple, returnField, }: {
    entity: any;
    where: any;
    is: any;
    multiple: any;
    returnField: any;
}) => string;
export declare const parseGetString: (key: string) => {};
