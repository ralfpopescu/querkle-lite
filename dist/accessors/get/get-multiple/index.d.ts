import { Dependencies, IsValue, StringKeys } from '../../index';
declare type GetMultipleAccessorOptions<T> = {
    readonly entity: string;
    readonly where: StringKeys<T>;
    readonly isIn: ReadonlyArray<IsValue>;
    readonly parameterize?: boolean;
};
export declare const getMultiple: ({ pool, model, translator, schemaName, }: Dependencies) => <T>({ entity, where, isIn, parameterize, }: GetMultipleAccessorOptions<T>) => Promise<readonly T[]>;
export {};
