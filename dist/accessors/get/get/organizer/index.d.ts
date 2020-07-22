import { SerializedGet } from '../serializer';
import { GetByEntity } from '../get-batch-function';
export declare const organizer: <T>(gets: ReadonlyArray<SerializedGet>) => readonly GetByEntity<T>[];
