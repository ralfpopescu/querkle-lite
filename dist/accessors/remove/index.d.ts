import { Dependencies, IsValue, StringKeys } from '../index';
declare type BaseOptions<T> = {
    readonly entity: string;
    readonly where: StringKeys<T>;
    readonly is: IsValue;
};
declare type RemoveOptionsSingle<T> = BaseOptions<T> & {
    readonly multiple?: false;
};
declare type RemoveOptionsMultiple<T> = BaseOptions<T> & {
    readonly multiple: true;
};
declare type WithQuantity<T> = T & {
    readonly quantity: number;
};
declare type Remove = {
    <T>(options: RemoveOptionsSingle<T>): Promise<WithQuantity<T>>;
    <T>(options: RemoveOptionsMultiple<T>): Promise<ReadonlyArray<WithQuantity<T>>>;
};
export declare const remove: ({ pool, translator, }: Dependencies) => Remove;
export {};
