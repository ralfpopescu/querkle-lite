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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMany = void 0;
const mssql_1 = __importDefault(require("mssql"));
const services_1 = require("../../../services");
const createColumn = (paramName, entity, model, translator) => {
    const paramTypeName = model[entity][paramName].typeName;
    const { length, precision, scale } = model[entity][paramName].type;
    let suffix = '';
    if (length)
        suffix = `(${length})`;
    if (scale)
        suffix = `(${scale})`;
    if (precision && scale)
        suffix = `(${precision}, ${scale})`;
    return `${translator.objToRel(paramName)} ${paramTypeName}${suffix}${model[entity][paramName].nullable ? '' : ' NOT NULL'}`;
};
const serializeColumns = inputArray => Object.keys(inputArray[0]).join('_');
exports.insertMany = ({ pool, model, translator, schemaName, }) => ({ entity, inputArray, returnInserted, }) => __awaiter(void 0, void 0, void 0, function* () {
    if (entity === null || entity === undefined) {
        throw new Error('entity was not provided for insertMany operation.');
    }
    if (inputArray === null || inputArray === undefined) {
        throw new Error(`inputArray was not provided for insertMany operation (entity: ${entity}).`);
    }
    if (!Array.isArray(inputArray)) {
        throw new Error(`inputArray is not array for insertMany operation (entity: ${entity}).`);
    }
    if (inputArray.length > 1
        && !inputArray.slice(1).reduce((acc, curr, i) => acc
            && Object.keys(curr).sort().join(',') === Object.keys(inputArray[i]).sort().join(','), true)) {
        throw new Error(`All elements of input array need to have the same keys (entity: ${entity}).`);
    }
    if (returnInserted) {
        const tempTableName = `##staging_${entity}_${serializeColumns(inputArray)}`;
        const createStagingTable = `
    IF OBJECT_ID('tempdb..${tempTableName}') IS NOT NULL
      TRUNCATE TABLE ${tempTableName}
    ELSE
      CREATE TABLE ${tempTableName}
    (
      ${Object.keys(inputArray[0])
            .map(paramName => createColumn(paramName, entity, model, translator))
            .join(', \n')}
    )`;
        yield pool.query(createStagingTable);
        const tableName = `${tempTableName}`;
        const table = new mssql_1.default.Table(tableName);
        const params = Object.keys(inputArray[0]);
        params.forEach((param) => table.columns
            .add(translator.objToRel(param), services_1.determineType({ param, entity, model }), { nullable: model[entity][param].nullable }));
        inputArray.forEach((input) => {
            const row = Object.values(input);
            table.rows.add(...row);
        });
        const request = new mssql_1.default.Request(pool);
        yield request.bulk(table);
        const insertIntoPrimaryTable = `
    INSERT INTO ${schemaName}.[${translator.objToRel(entity)}] ( ${Object.keys(inputArray[0]).map(paramName => translator.objToRel(paramName)).join(', ')})
    OUTPUT INSERTED.*
    SELECT ${Object.keys(inputArray[0]).map(paramName => translator.objToRel(paramName)).join(', ')} FROM ${tempTableName};
    `;
        const result = yield pool.query(insertIntoPrimaryTable);
        return services_1.format(result.recordset, translator);
    }
    const tableName = `${schemaName}.[${translator.objToRel(entity)}]`;
    const table = new mssql_1.default.Table(tableName);
    const params = Object.keys(inputArray[0]);
    params.forEach(param => table.columns
        .add(translator.objToRel(param), services_1.determineType({ param, entity, model }), { nullable: model[entity][param].nullable }));
    inputArray.forEach(input => {
        const row = Object.values(input);
        table.rows.add(...row);
    });
    const request = new mssql_1.default.Request(pool);
    yield request.bulk(table);
    return inputArray;
});
//# sourceMappingURL=index.js.map