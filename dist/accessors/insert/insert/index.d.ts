import { Dependencies, ExcludeGeneratedColumns } from '../../index';
declare type InsertOptions<T> = {
    readonly entity: string;
    readonly input: ExcludeGeneratedColumns<T>;
};
export declare const insert: ({ pool, translator, }: Dependencies) => <T>({ entity, input }: InsertOptions<T>) => Promise<T>;
export {};
