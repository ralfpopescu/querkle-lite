"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeBatchSql = exports.serializeBatchSql = exports.generateParamSerialization = exports.decode = exports.encode = void 0;
const btoa_1 = __importDefault(require("btoa"));
const atob_1 = __importDefault(require("atob"));
exports.encode = str => btoa_1.default(str);
exports.decode = str => atob_1.default(str);
exports.generateParamSerialization = (params) => {
    const sortedParamKeys = Object.keys(params).sort();
    const sortedObjectArray = sortedParamKeys.map(key => params[key]);
    return sortedObjectArray.reduce((acc, curr, index) => {
        const key = Object.keys(curr)[0];
        const value = curr[key];
        return exports.encode(`${acc}${key}:${value}${index < sortedObjectArray.length ? '+' : ''}`);
    }, '');
};
exports.serializeBatchSql = ({ queryString, params, paramTypes, addToBatch, batchEntity, batchParam, multiple, transform, transformMultiple, parameterize, }) => {
    let paramString = 'none';
    if (params && Object.keys(params).length > 0) {
        paramString = exports.generateParamSerialization(params);
    }
    const queryHash = exports.encode(queryString);
    const serialization = `${queryHash}-${paramString}-${addToBatch != null ? addToBatch : 'none'}-${multiple ? 'yes' : 'no'}`;
    return {
        serialization,
        paramTypes,
        batchEntity,
        batchParam,
        transform,
        transformMultiple,
        parameterize,
    };
};
exports.deserializeBatchSql = (serializedBatchSql) => {
    const splitSerializedBatchSql = serializedBatchSql.serialization.split('-');
    const hashedQueryString = splitSerializedBatchSql[0];
    const queryString = exports.decode(hashedQueryString);
    const paramString = splitSerializedBatchSql[1];
    let params;
    if (paramString === 'none') {
        params = null;
    }
    else {
        const decodedParamString = exports.decode(paramString);
        const splitParams = decodedParamString.split('+');
        params = splitParams
            .map(param => {
            const splitParam = param.split(':');
            return { [splitParam[0]]: splitParam[1] };
        })
            .reduce((acc, curr) => (Object.assign(Object.assign({}, acc), curr)));
    }
    const addToBatch = splitSerializedBatchSql[2] === 'none' ? null : splitSerializedBatchSql[2];
    const multiple = splitSerializedBatchSql[3] === 'yes';
    const { paramTypes, batchEntity, batchParam, transform, transformMultiple, parameterize, } = serializedBatchSql;
    return {
        queryString,
        params,
        paramString,
        paramTypes,
        batchEntity,
        batchParam,
        addToBatch,
        multiple,
        transform,
        transformMultiple,
        parameterize,
        hashedQueryString,
    };
};
//# sourceMappingURL=index.js.map