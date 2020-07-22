import { GetBatchedResult } from '../executions';
import { SerializedGet } from '../serializer';
export declare type PreparedResult = object;
export declare const prepareResults: <T>(gets: ReadonlyArray<SerializedGet>, allResults: readonly GetBatchedResult<T>[]) => ReadonlyArray<PreparedResult>;
