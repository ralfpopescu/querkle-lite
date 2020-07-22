import { Translator } from '../../../services/db-stringifier';
import { DeserializedBatchSql } from '../serializer';
import { BatchResult } from '../executions/execute';
interface PrepareResultsForDataLoaderOptions<T, R> {
    readonly deserializedBatchedSqls: ReadonlyArray<DeserializedBatchSql<T, R>>;
    readonly results: ReadonlyArray<BatchResult<T>>;
    readonly translator: Translator;
}
export declare const prepareResultsForDataLoader: <T, R>({ deserializedBatchedSqls, results, translator, }: PrepareResultsForDataLoaderOptions<T, R>) => any[];
export {};
