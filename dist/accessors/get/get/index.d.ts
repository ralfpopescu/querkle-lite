import DataLoader from 'dataloader';
import { IsValue, Transform, TransformMultiple } from '../../index';
declare type BaseOptions<T> = {
    readonly entity: string;
    readonly where: keyof T;
    readonly is: IsValue;
};
declare type WithReturnField<B, T> = B & {
    readonly returnField: keyof T;
};
declare type WithTransform<B, T, R> = B & {
    readonly transform: Transform<T, R>;
};
declare type WithTransformMultiple<B, T, R> = B & {
    readonly transformMultiple: TransformMultiple<T, R>;
};
declare type OptionsSingle<T> = BaseOptions<T> & {
    readonly multiple?: false;
};
declare type OptionsSingleTransform<T, R> = WithTransform<OptionsSingle<T>, T, R>;
declare type OptionsSingleReturnField<T, K extends keyof T> = WithReturnField<BaseOptions<T>, T> & {
    readonly multiple?: false;
};
declare type OptionsSingleReturnFieldTransform<T, R, K extends keyof T> = WithTransform<OptionsSingleReturnField<T, K>, T, R>;
declare type OptionsMultiple<T> = BaseOptions<T> & {
    readonly multiple: true;
};
declare type OptionsMultipleTransform<T, R> = WithTransform<OptionsMultiple<T>, T, R>;
declare type OptionsMultipleTransformMultiple<T, R> = WithTransformMultiple<OptionsMultiple<T>, T, R>;
declare type OptionsMultipleReturnField<T, K extends keyof T> = WithReturnField<OptionsMultiple<T>, T>;
declare type OptionsMultipleReturnFieldTransform<T, R, K extends keyof T> = WithReturnField<OptionsMultipleTransform<T, R>, T>;
declare type OptionsMultipleReturnFieldTransformMultiple<T, R, K extends keyof T> = WithReturnField<OptionsMultipleTransformMultiple<T, R>, T>;
export declare type Get = {
    <T, R = any, K = never>(options: BaseOptions<T>): Promise<T>;
    <T, R = any, K = never>(options: OptionsSingle<T>): Promise<T>;
    <T, R = any, K = never>(options: OptionsSingleTransform<T, R>): Promise<R>;
    <T, R = any, K extends keyof T = any>(options: OptionsSingleReturnField<T, K>): Promise<T>;
    <T, R = any, K extends keyof T = any>(options: OptionsSingleReturnFieldTransform<T, R, K>): Promise<R>;
    <T, R = any, K = never>(options: OptionsMultiple<T>): Promise<ReadonlyArray<T>>;
    <T, R = any, K = never>(options: OptionsMultipleTransform<T, R>): Promise<ReadonlyArray<R>>;
    <T, R = any, K = never>(options: OptionsMultipleTransformMultiple<T, R>): Promise<R>;
    <T, R = any, K extends keyof T = any>(options: OptionsMultipleReturnField<T, K>): Promise<ReadonlyArray<T>>;
    <T, R = any, K extends keyof T = any>(options: OptionsMultipleReturnFieldTransform<T, R, K>): Promise<ReadonlyArray<R>>;
    <T, R = any, K extends keyof T = any>(options: OptionsMultipleReturnFieldTransformMultiple<T, R, K>): Promise<R>;
};
export declare const get: (dataLoader: DataLoader<any, any>) => Get;
export {};
