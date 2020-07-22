import { stringifyGet } from '../../../../services';
import { IsValue } from '../../../index';

export type SerializedGet = {
  readonly serialization: string;
  readonly entity: string;
  readonly where: string;
  readonly is: IsValue;
  readonly multiple: boolean;
  readonly returnField: string;
  readonly transform: Function;
  readonly transformMultiple: Function;
};

type DeserializedGet = {
  readonly entity: string;
  readonly where: string;
  readonly is: IsValue;
  readonly multiple: boolean;
  readonly returnField: string;
  readonly transform?: Function;
  readonly transformMultiple?: Function;
};

export const serializeGet = ({
  entity,
  where,
  is,
  multiple,
  returnField,
  transform,
  transformMultiple,
}: DeserializedGet): SerializedGet => ({
  serialization: stringifyGet({
    entity,
    where,
    is,
    multiple,
    returnField,
  }),
  entity,
  where,
  is,
  multiple,
  returnField,
  transform,
  transformMultiple,
});

export const deserializeGet = (serializedGet: SerializedGet) => serializedGet;
