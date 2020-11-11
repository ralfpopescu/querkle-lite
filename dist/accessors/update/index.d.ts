import { Dependencies, ExcludeGeneratedColumns, IsValue, StringKeys } from '../index';
declare type BaseOptions<T> = {
    readonly entity: string;
    readonly input: Partial<ExcludeGeneratedColumns<T>>;
    readonly where: StringKeys<T>;
    readonly is: IsValue;
    readonly multiple?: boolean;
};
declare type OptionsSingle<T> = BaseOptions<T> & {
    readonly multiple?: false;
};
declare type OptionsMultiple<T> = BaseOptions<T> & {
    readonly multiple: true;
};
declare type Update = {
    <T>(options: OptionsSingle<T>): Promise<T>;
    <T>(options: OptionsMultiple<T>): Promise<ReadonlyArray<T>>;
};
export declare const update: ({ pool, translator, }: Dependencies) => Update;
export {};
