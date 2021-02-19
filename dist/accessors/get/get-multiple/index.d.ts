import { Dependencies, IsValue, StringKeys } from '../../index';
declare type GetMultipleAccessorOptions<T> = {
    readonly entity: string;
    readonly where: StringKeys<T>;
    readonly isIn: Array<IsValue>;
    readonly parameterize?: boolean;
};
export declare const getMultiple: ({ pool, translator, }: Dependencies) => <T>({ entity, where, isIn, }: GetMultipleAccessorOptions<T>) => Promise<readonly T[]>;
export {};
