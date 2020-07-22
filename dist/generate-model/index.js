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
exports.generateModel = void 0;
const db_stringifier_1 = require("../services/db-stringifier");
const sql_types_1 = require("../sql-types");
exports.generateModel = (pool, schemaName, translator = db_stringifier_1.defaultTranslator) => __awaiter(void 0, void 0, void 0, function* () {
    const model = {};
    const response = yield pool.request().query('SELECT * FROM INFORMATION_SCHEMA.COLUMNS');
    const schema = response.recordset;
    const availableSchemas = new Set();
    for (let i = 0; i < schema.length; i += 1) {
        const item = schema[i];
        const itemSchemaName = item.TABLE_SCHEMA;
        availableSchemas.add(itemSchemaName);
        if (itemSchemaName.toLowerCase() === schemaName.toLowerCase()) {
            const tableName = translator.relToObj(item.TABLE_NAME);
            const columnName = translator.relToObj(item.COLUMN_NAME);
            const nullable = item.IS_NULLABLE === 'YES';
            const type = item.DATA_TYPE;
            const columnDefault = item.COLUMN_DEFAULT;
            const varCharLength = item.CHARACTER_MAXIMUM_LENGTH;
            const datetimePrecision = item.DATETIME_PRECISION;
            const numericPrecision = item.NUMERIC_PRECISION;
            const numericScale = item.NUMERIC_SCALE;
            let sqlType = null;
            switch (type) {
                case 'datetime2':
                    sqlType = sql_types_1.sqlTypes.dateTime2(datetimePrecision);
                    break;
                case 'int':
                    sqlType = sql_types_1.sqlTypes.int;
                    break;
                case 'bigint':
                    sqlType = sql_types_1.sqlTypes.bigInt;
                    break;
                case 'float':
                    sqlType = sql_types_1.sqlTypes.float;
                    break;
                case 'decimal':
                    sqlType = sql_types_1.sqlTypes.decimal(numericPrecision, numericScale);
                    break;
                case 'smallint':
                    sqlType = sql_types_1.sqlTypes.smallInt;
                    break;
                case 'varchar':
                    sqlType = sql_types_1.sqlTypes.varChar(varCharLength);
                    break;
                case 'bit':
                    sqlType = sql_types_1.sqlTypes.bit;
                    break;
                case 'char':
                    sqlType = sql_types_1.sqlTypes.char(item.CHARACTER_MAXIMUM_LENGTH);
                    break;
                default:
                    console.log(`SQL type not defined for ${type}`);
            }
            if (model[tableName]) {
                model[tableName][columnName] = {
                    type: sqlType,
                    typeName: type,
                    nullable,
                    columnDefault,
                };
            }
            else {
                model[tableName] = { [columnName]: { type: sqlType, nullable, typeName: type } };
            }
        }
    }
    if (Object.keys(model).length === 0) {
        throw new Error(`Schema ${schemaName} provided no model. Available schemas: ${JSON.stringify(Array.from(availableSchemas))}`);
    }
    return model;
});
//# sourceMappingURL=index.js.map