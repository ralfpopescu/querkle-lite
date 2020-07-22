import { OrganizedBatchedSqls } from '../organizer';
import { Dependencies } from '../../index';
interface ExecuteOrganizedBatchedSqlsOptions<T> {
    readonly organizedBatchedSqls: OrganizedBatchedSqls<T>;
}
export declare const executeOrganizedBatchedSqls: (dependencies: Dependencies) => <T>({ organizedBatchedSqls }: ExecuteOrganizedBatchedSqlsOptions<T>) => Promise<import("./execute").BatchResult<T>[]>;
export {};
