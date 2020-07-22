import sql, { ConnectionPool } from 'mssql';
import { Params, ParamTypes } from '../../accessors/execute-sql';
declare type QueryOptions = {
    readonly queryString: string;
    readonly params: Params;
    readonly paramTypes: ParamTypes;
    readonly pool: ConnectionPool;
};
export declare const query: <T = any>({ queryString, params, paramTypes, pool, }: QueryOptions) => Promise<sql.IRecordSet<T & {
    readonly errorNumber?: number;
    readonly errorSeverity?: number;
    readonly errorState?: string;
    readonly errorProcedure?: string;
    readonly errorLine?: number;
    readonly errorMessage?: string;
}>>;
export {};
