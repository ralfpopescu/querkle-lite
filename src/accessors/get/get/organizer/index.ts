import { deserializeGet, SerializedGet } from '../serializer';
import { GetByEntity } from '../get-batch-function';
import { StringKeys } from '../../../index';

export const organizer = <T>(gets: ReadonlyArray<SerializedGet>): ReadonlyArray<GetByEntity<T>> => {
  const deserializedGets = gets.map(g => deserializeGet(g));
  const entities = [...new Set(deserializedGets.map(g => g.entity))];

  return entities.map((entity) => ({
    entity,
    keyValues: [...new Set(
      deserializedGets
        .filter(g => g.entity === entity)
        .map(g => g.where),
    )]
      .map((key: StringKeys<T>) => ({
        key,
        values: deserializedGets
          .filter(g => g.entity === entity)
          .map(g => g.is),
      })),
  }));
};
