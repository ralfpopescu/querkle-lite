"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeArbitraryString = exports.getParamTypes = exports.parseGetString = exports.stringifyGet = exports.format = exports.parseNumber = exports.determineType = exports.inferType = void 0;
const mssql_1 = __importDefault(require("mssql"));
const db_stringifier_1 = require("./db-stringifier");
var query_1 = require("./query");
Object.defineProperty(exports, "query", { enumerable: true, get: function () { return query_1.query; } });
exports.dbStringifier = __importStar(require("./db-stringifier"));
const NoNullError = (entity, param) => new Error(`Tried to infer type from a falsy value. entity: ${entity}, param: ${param}`);
exports.inferType = (entity, param, value) => {
    switch (typeof value) {
        case 'string':
            return mssql_1.default.VarChar;
        case 'number':
            return value < 2147483647 ? mssql_1.default.Int : mssql_1.default.BigInt;
        case 'boolean':
            return mssql_1.default.Bit;
        case 'undefined':
            throw NoNullError(entity, param);
        case 'symbol':
            throw NoNullError(entity, param);
        default:
            throw NoNullError(entity, param);
    }
};
exports.determineType = ({ param, value, entity, model, }) => {
    const entityModel = model[entity];
    if (!entityModel) {
        throw new Error(`Model for ${entity} is not defined.`);
    }
    if (!entityModel[param]) {
        throw new Error(`Field ${param} on ${entity} is not defined in the model.`);
    }
    return entityModel[param].type || exports.inferType(entity, param, value);
};
exports.parseNumber = (value, param, entity, model) => {
    if (value) {
        return `${value}`;
    }
    if (value == null)
        return null;
    const sqlType = exports.determineType({
        param,
        entity,
        value,
        model,
    });
    if (sqlType === mssql_1.default.Int || sqlType === mssql_1.default.BigInt) {
        return parseInt(value, 10);
    }
    if (sqlType === mssql_1.default.Float) {
        return parseFloat(value);
    }
    return value;
};
exports.format = (recordset, translator) => {
    if (!recordset) {
        throw new Error(`Operation did not return an array of values. Recordset: ${recordset}`);
    }
    // The TS workaround `as unknown` is needed because there's no TS snake to
    // camel conversion.
    return recordset.map(row => db_stringifier_1.format(row, translator.relToObj));
};
exports.stringifyGet = ({ entity, where, is, multiple, returnField, }) => `${entity}-${where}-${is}-${multiple ? 'y' : 'n'}-${returnField || 'null'}`;
exports.parseGetString = (key) => key
    .split('-')
    .map((item, i) => {
    if (i === 0) {
        return { entity: item };
    }
    if (i === 1) {
        return { where: item };
    }
    if (i === 2) {
        return { is: item === 'null' ? null : item };
    }
    if (i === 3) {
        return { multiple: item === 'y' };
    }
    return { returnField: item === 'null' ? null : item };
})
    .reduce((acc, curr) => (Object.assign(Object.assign({}, acc), curr)), {});
exports.getParamTypes = (model) => ({ entity, params }) => params
    .map(param => ({ [param]: exports.determineType({ entity, param, model }) }))
    .reduce((acc, curr) => (Object.assign(Object.assign({}, acc), curr)));
exports.makeArbitraryString = (value) => `a${value}`;
//# sourceMappingURL=index.js.map