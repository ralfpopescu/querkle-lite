import { EntityParams, EntityParamTypes, Params, ParamTypes } from '../../../execute-sql';
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
    readonly params: EntityParams<T>;
    readonly paramTypes: EntityParamTypes<T>;
    readonly hashedQueryString: string;
    readonly hashedParamString: string;
    readonly batchEntity: string;
    readonly batchParam: StringKeys<T>;
};
declare type HasBatchOptions<T> = BaseOptions<T> & {
    readonly batchValues: Params;
    readonly batchTypes: ParamTypes;
};
export declare const executeHasBatch: <T>(dependencies: Dependencies) => ({ queryString, params, paramTypes, hashedQueryString, hashedParamString, batchEntity, batchParam, batchValues, batchTypes, }: HasBatchOptions<T>) => Promise<BatchResult<T>>;
export declare const executeNoBatch: <T>(dependencies: Dependencies) => ({ queryString, params, paramTypes, hashedQueryString, hashedParamString, batchEntity, batchParam, }: BaseOptions<T>) => Promise<BatchResult<T>>;
export declare const executeHasBatchNoParameterization: <T>(dependencies: Dependencies) => ({ queryString, params, paramTypes, hashedQueryString, hashedParamString, batchEntity, batchParam, }: BaseOptions<T>) => Promise<BatchResult<T>>;
export {};
