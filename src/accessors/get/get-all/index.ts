import { format, query } from '../../../services';
import { Dependencies } from '../../index';

type GetAllAccessorOptions = {
  readonly entity: string;
};

export const getAll = ({
  pool,
  translator,
  schemaName,
}: Dependencies) => async <T>({ entity }: GetAllAccessorOptions) => {
  if (!entity) {
    throw new Error('entity was not provided for getAll operation.');
  }

  const queryString = `SELECT * FROM ${schemaName}.[${translator.objToRel(entity)}];`;

  // TODO: Fix types here.
  // @ts-ignore
  const response = await query({ queryString, pool });
  return format<T>(response, translator);
};
