import sql from 'mssql';
declare type ErrorResponse = {
    readonly errorNumber?: number;
    readonly errorSeverity?: number;
    readonly errorState?: string;
    readonly errorProcedure?: string;
    readonly errorLine?: number;
    readonly errorMessage?: string;
};
export declare type IRecordSetWithError<T> = sql.IRecordSet<T & ErrorResponse>;
export declare type IResultWithError<T> = sql.IResult<T & ErrorResponse>;
export declare const wrapSqlInTryCatch: (queryString: string) => string;
export declare const handleErrors: <T>(input: IResultWithError<T>) => sql.IRecordSet<T & ErrorResponse>;
export {};
