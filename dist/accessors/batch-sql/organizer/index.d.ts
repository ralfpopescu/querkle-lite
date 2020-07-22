import { DeserializedBatchSql } from '../serializer';
import { EntityParams, EntityParamTypes } from '../../execute-sql';
import { StringKeys } from '../../index';
declare type ParamConfig<T> = {
    readonly params: EntityParams<T> | null;
    readonly paramTypes?: EntityParamTypes<T>;
    readonly multiple: boolean;
    readonly batchEntity: string;
    readonly batchParam: StringKeys<T>;
    readonly addToBatches: ReadonlyArray<string>;
};
export declare type OrganizedBatchedSqls<T> = {
    readonly [hash: string]: {
        readonly queryString: string;
        readonly parameterize?: boolean;
    } & {
        readonly [paramString: string]: ParamConfig<T>;
    };
};
export declare const organizeBatchedSqls: <T, R>(deserializedBatchedSqls: readonly DeserializedBatchSql<T, R>[]) => OrganizedBatchedSqls<T>;
export {};
