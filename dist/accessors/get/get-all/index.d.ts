import { Dependencies } from '../../index';
declare type GetAllAccessorOptions = {
    readonly entity: string;
};
export declare const getAll: ({ pool, translator, }: Dependencies) => <T>({ entity }: GetAllAccessorOptions) => Promise<readonly T[]>;
export {};
