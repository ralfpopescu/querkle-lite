import { Params } from '../../../execute-sql';
import { Dependencies, StringKeys } from '../../../index';
export declare type BatchResult<T> = {
    readonly result: ReadonlyArray<T>;
    readonly hashedQueryString: string;
    readonly hashedParamString: string;
    readonly batchEntity: string;
    readonly batchParam: StringKeys<T>;
    readonly paramString?: string;
};
declare type BaseOptions<T> = {
    readonly queryString: string;
    readonly params: Array<any>;
    readonly hashedQueryString: string;
    readonly hashedParamString: string;
    readonly batchEntity: string;
    readonly batchParam: StringKeys<T>;
};
declare type HasBatchOptions<T> = BaseOptions<T> & {
    readonly batchValues: Params;
};
export declare const executeHasBatch: <T>(dependencies: Dependencies) => ({ queryString, params, hashedQueryString, hashedParamString, batchEntity, batchParam, batchValues, }: HasBatchOptions<T>) => Promise<BatchResult<T>>;
export declare const executeNoBatch: <T>(dependencies: Dependencies) => ({ queryString, params, hashedQueryString, hashedParamString, batchEntity, batchParam, }: BaseOptions<T>) => Promise<BatchResult<T>>;
export declare const executeHasBatchNoParameterization: <T>(dependencies: Dependencies) => ({ queryString, params, hashedQueryString, hashedParamString, batchEntity, batchParam, }: BaseOptions<T>) => Promise<BatchResult<T>>;
export {};
