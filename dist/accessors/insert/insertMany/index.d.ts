import { Dependencies, ExcludeGeneratedColumns } from '../../index';
declare type InsertManyOptions<T> = {
    readonly entity: string;
    readonly inputArray: ReadonlyArray<Partial<ExcludeGeneratedColumns<T>>>;
    readonly returnInserted?: boolean;
};
export declare const insertMany: ({ pool, model, translator, schemaName, }: Dependencies) => <T>({ entity, inputArray, returnInserted, }: InsertManyOptions<T>) => Promise<readonly T[]>;
export {};
