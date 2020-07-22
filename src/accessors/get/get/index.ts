import DataLoader from 'dataloader';

import { serializeGet } from './serializer';
import { IsValue, Transform, TransformMultiple } from '../../index';

type BaseOptions<T> = {
  readonly entity: string;
  readonly where: keyof T;
  readonly is: IsValue;
};

type WithReturnField<B, T> = B & { readonly returnField: keyof T; } ;
type WithTransform<B, T, R> = B & { readonly transform: Transform<T, R> } ;
type WithTransformMultiple<B, T, R> = B & { readonly transformMultiple: TransformMultiple<T, R> } ;

type OptionsSingle<T> = BaseOptions<T> & {
  readonly multiple?: false;
};

type OptionsSingleTransform<T, R> = WithTransform<OptionsSingle<T>, T, R>

type OptionsSingleReturnField<T, K extends keyof T> = WithReturnField<BaseOptions<T>, T> & {
  readonly multiple?: false;
};

type OptionsSingleReturnFieldTransform<T, R, K extends keyof T> = WithTransform<OptionsSingleReturnField<T, K>, T, R>;

type OptionsMultiple<T> = BaseOptions<T> & {
  readonly multiple: true;
};

type OptionsMultipleTransform<T, R> = WithTransform<OptionsMultiple<T>, T, R>
type OptionsMultipleTransformMultiple<T, R> = WithTransformMultiple<OptionsMultiple<T>, T, R>
type OptionsMultipleReturnField<T, K extends keyof T> = WithReturnField<OptionsMultiple<T>, T>;
type OptionsMultipleReturnFieldTransform<T, R, K extends keyof T> = WithReturnField<OptionsMultipleTransform<T, R>, T>;
type OptionsMultipleReturnFieldTransformMultiple<T, R, K extends keyof T> = WithReturnField<OptionsMultipleTransformMultiple<T, R>, T>;

export type Get = {
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

export const get = (dataLoader: DataLoader<any, any>): Get => ({
  entity,
  where,
  is,
  multiple,
  returnField,
  transform,
  transformMultiple,
}) => {
  if (entity === null || entity === undefined) {
    throw new Error('entity was not provided for get operation.');
  }
  if (where === null || where === undefined) {
    throw new Error(`'where' parameter was not provided for get operation (entity: ${entity}).`);
  }
  if (returnField && (transform || transformMultiple)) {
    throw new Error('returnField and transform/transformMultiple cannot be used simulataneously');
  }
  if (transform && typeof transform !== 'function') {
    throw new Error('transform is not a function.');
  }
  if (transformMultiple && typeof transformMultiple !== 'function') {
    throw new Error('transformMultiple is not a function.');
  }
  if (!dataLoader) {
    throw new Error('dataLoader must be provided to get.');
  }

  return dataLoader.load(serializeGet({
    entity,
    where,
    is,
    multiple,
    returnField,
    transform,
    transformMultiple,
  }));
};
