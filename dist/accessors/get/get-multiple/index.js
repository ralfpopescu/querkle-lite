"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMultiple = void 0;
const services_1 = require("../../../services");
const objectReducer = (acc, curr) => {
    for (const key in curr) {
        if (Object.prototype.hasOwnProperty.call(curr, key)) {
            acc[key] = curr[key];
        }
    }
    return acc;
};
const createUnparameterizedValueString = (entity, where, model, isIn) => isIn.map(value => {
    if (value == null) {
        return 'NULL';
    }
    const paramTypeName = model[entity][where].typeName;
    if (paramTypeName === 'int'
        || paramTypeName === 'decimal'
        || paramTypeName === 'smallint'
        || paramTypeName === 'bit') {
        return value;
    }
    return `'${value}'`;
}).join(' ,');
exports.getMultiple = ({ pool, model, translator, schemaName, }) => ({ entity, where, isIn, parameterize, }) => __awaiter(void 0, void 0, void 0, function* () {
    if (entity === null || entity === undefined) {
        throw new Error('entity was not provided for getMultiple operation.');
    }
    if (where === null || where === undefined) {
        throw new Error(`'where' parameter was not provided for getMultiple operation (entity: ${entity}).`);
    }
    if (!isIn) {
        throw new Error(`'isIn' parameter was not provided for getMultiple operation (entity: ${entity}).`);
    }
    if (!model[entity]) {
        throw new Error(`Model does not contain entity (entity: ${entity}).`);
    }
    // @ts-ignore
    if (!model[entity][where]) {
        throw new Error(`Model does not contain column for entity (entity: ${entity}, column: ${where}).`);
    }
    if (!Array.isArray(isIn)) {
        throw new Error(`'isIn' parameter provided is not an array (entity: ${entity}).`);
    }
    if (parameterize !== true) {
        const queryString = `
      SELECT * FROM ${schemaName}.[${translator.objToRel(entity)}]
      WHERE ${translator.objToRel(where)} IN (${createUnparameterizedValueString(entity, where, model, isIn)});
    `;
        // TODO: Fix types here.
        // @ts-ignore
        const response = yield services_1.query({
            queryString,
            pool,
        });
        return services_1.format(response, translator);
    }
    const paramTypes = isIn
        .map(value => ({
        // TODO: Fix types here.
        // @ts-ignore
        [services_1.makeArbitraryString(value)]: services_1.determineType({
            param: where,
            entity,
            model,
        }),
    }))
        .reduce(objectReducer, {});
    const params = isIn
        .map(value => ({ [services_1.makeArbitraryString(value)]: services_1.parseNumber(value, where, entity, model) }))
        .reduce(objectReducer, {});
    const queryString = `
    SELECT * FROM ${schemaName}.[${translator.objToRel(entity)}]
    WHERE ${translator.objToRel(where)} IN ${services_1.dbStringifier.valueString(params)};
  `;
    const response = yield services_1.query({
        queryString,
        params,
        paramTypes,
        pool,
    });
    return services_1.format(response, translator);
});
//# sourceMappingURL=index.js.map