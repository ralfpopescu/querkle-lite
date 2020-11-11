import { Dependencies, ExcludeGeneratedColumns } from '../../index';
declare type InsertManyOptions<T> = {
    readonly entity: string;
    readonly inputArray: ReadonlyArray<Partial<ExcludeGeneratedColumns<T>>>;
};
export declare const insertMany: ({ pool, translator, }: Dependencies) => <T>({ entity, inputArray, }: InsertManyOptions<T>) => Promise<readonly T[]>;
export {};
