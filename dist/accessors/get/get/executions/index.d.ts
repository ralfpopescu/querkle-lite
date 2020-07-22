import { Dependencies, StringKeys } from '../../../index';
import { GetByEntity } from '../get-batch-function';
export declare type GetBatchedResult<T> = {
    readonly entity: string;
    readonly key: StringKeys<T>;
    readonly results: ReadonlyArray<T>;
};
export declare const executeGets: <T>(dependencies: Dependencies) => (getsByEntity: readonly GetByEntity<T>[]) => Promise<GetBatchedResult<T>[]>;
