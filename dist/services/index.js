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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGetString = exports.stringifyGet = exports.format = void 0;
const db_stringifier_1 = require("./db-stringifier");
var query_1 = require("./query");
Object.defineProperty(exports, "query", { enumerable: true, get: function () { return query_1.query; } });
exports.dbStringifier = __importStar(require("./db-stringifier"));
exports.format = (rows, translator) => {
    if (!rows) {
        throw new Error(`Operation did not return an array of values. Rows: ${rows}`);
    }
    // The TS workaround `as unknown` is needed because there's no TS snake to
    // camel conversion.
    return rows.map(row => db_stringifier_1.format(row, translator.relToObj));
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
//# sourceMappingURL=index.js.map