import { format, query } from '../../services';
import { StringKeys } from '../index';
import { ColumnType } from '../../generate-model';

export type Params = { readonly [key: string]: string | number };
export type ParamTypes = { readonly [key: string]: ColumnType };

export type EntityParams<T> = { readonly [key in StringKeys<T>]: string | number };
export type EntityParamTypes<T> = { readonly [key in StringKeys<T>]: ColumnType };

type BaseOptions<T> = {
  readonly queryString: string;
  readonly params?: EntityParams<T>;
  readonly paramTypes?: EntityParamTypes<T>;
};

type OptionsSingle<T> = BaseOptions<T> & {
  readonly multiple?: false;
};

type OptionsMultiple<T> = BaseOptions<T> & {
  readonly multiple: true;
};

type ExecuteSql = {
  <T>(options: OptionsSingle<T>): Promise<T>;
  <T>(options: OptionsMultiple<T>): Promise<ReadonlyArray<T>>;
};

export const executeSql = ({
  pool,
  translator,
}): ExecuteSql => async <T>({
  queryString,
  params,
  paramTypes,
  multiple,
}) => {
  try {
    const response = await query({
      queryString,
      params,
      paramTypes,
      pool,
    });

    return multiple ? format<T>(response, translator) : format<T>(response, translator)[0];
  } catch (e) {
    throw new Error(`executeSql ERROR: ${e.message} --- query string: ${queryString}`);
  }
};
