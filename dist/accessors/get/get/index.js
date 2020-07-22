"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = void 0;
const serializer_1 = require("./serializer");
exports.get = (dataLoader) => ({ entity, where, is, multiple, returnField, transform, transformMultiple, }) => {
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
    return dataLoader.load(serializer_1.serializeGet({
        entity,
        where,
        is,
        multiple,
        returnField,
        transform,
        transformMultiple,
    }));
};
//# sourceMappingURL=index.js.map