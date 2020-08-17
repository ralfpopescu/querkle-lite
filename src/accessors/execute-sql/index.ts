import { format, query } from '../../services';

export type Params = Array<string | number | boolean>;

type BaseOptions<T> = {
  readonly queryString: string;
  readonly params?: Params;
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
  multiple,
}) => {
  try {
    const response = await query({
      queryString,
      params,
      pool,
    });

    return multiple ? format<T>(response, translator) : format<T>(response, translator)[0];
  } catch (e) {
    throw new Error(`executeSql ERROR: ${e.message} --- query string: ${queryString}`);
  }
};
