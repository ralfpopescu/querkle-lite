export declare type Params = Array<string | number | boolean>;
declare type BaseOptions<T> = {
    readonly queryString: string;
    readonly params?: Params;
};
declare type OptionsSingle<T> = BaseOptions<T> & {
    readonly multiple?: false;
};
declare type OptionsMultiple<T> = BaseOptions<T> & {
    readonly multiple: true;
};
declare type ExecuteSql = {
    <T>(options: OptionsSingle<T>): Promise<T>;
    <T>(options: OptionsMultiple<T>): Promise<ReadonlyArray<T>>;
};
export declare const executeSql: ({ pool, translator, }: {
    pool: any;
    translator: any;
}) => ExecuteSql;
export {};
