"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeGet = exports.serializeGet = void 0;
const services_1 = require("../../../../services");
exports.serializeGet = ({ entity, where, is, multiple, returnField, transform, transformMultiple, }) => ({
    serialization: services_1.stringifyGet({
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
exports.deserializeGet = (serializedGet) => serializedGet;
//# sourceMappingURL=index.js.map