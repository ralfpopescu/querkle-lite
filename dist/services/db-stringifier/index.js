"use strict";
/* eslint-disable no-nested-ternary */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTranslator = exports.format = exports.stringifyUpdates = exports.multiValueString = exports.valueString = exports.keyString = exports.snakeToCamel = exports.camelToSnake = void 0;
exports.camelToSnake = (str) => str.split(/(?=[A-Z])/).join('_').toLowerCase();
exports.snakeToCamel = (str) => str.replace(/_([a-z])/g, g => g[1].toUpperCase());
exports.keyString = input => `(${Object.keys(input).map(key => exports.camelToSnake(key)).join(',')})`;
exports.valueString = paramsObj => `(${Object.keys(paramsObj).map((o) => `?`).join(',')})`;
exports.multiValueString = inputArray => inputArray
    .map((item, i) => `(${Object.keys(item)
    .map((o) => `?`).join(',')})`).join(',');
exports.stringifyUpdates = (updatedFields, translator) => {
    const keys = Object.keys(updatedFields);
    const updates = keys.map((key, i) => `${translator.objToRel(key)} = $${i + 1}`);
    return updates.join(',');
};
exports.format = (obj, relToObj) => Object
    .keys(obj)
    .map(key => ({ [relToObj(key)]: obj[key] })).reduce((acc, curr) => (Object.assign(Object.assign({}, acc), curr)));
exports.defaultTranslator = {
    objToRel: exports.camelToSnake,
    relToObj: exports.snakeToCamel,
};
//# sourceMappingURL=index.js.map