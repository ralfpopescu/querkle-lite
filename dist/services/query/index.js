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
exports.query = void 0;
const mssql_1 = __importDefault(require("mssql"));
const handle_error_1 = require("../../handle-error");
exports.query = ({ queryString, params, paramTypes, pool, }) => __awaiter(void 0, void 0, void 0, function* () {
    const ps = new mssql_1.default.PreparedStatement(pool);
    if (params) {
        Object
            .keys(params)
            .map(key => {
            if (!paramTypes[key]) {
                throw new Error(`Param type for ${key} was not provided.`);
            }
            return ps.input(key, paramTypes[key]);
        });
    }
    let execute;
    let prepare;
    try {
        prepare = yield ps.prepare(queryString);
    }
    catch (e) {
        throw new Error(`Error preparing statement: ${JSON.stringify(e.message)}: ${JSON.stringify(prepare)}`);
    }
    try {
        execute = yield ps.execute(params);
    }
    catch (e) {
        throw new Error(`Error executing statement: ${JSON.stringify(e.message)}: ${JSON.stringify(execute)}`);
    }
    try {
        yield ps.unprepare();
    }
    catch (e) {
        throw new Error('Error unpreparing statement: ');
    }
    return handle_error_1.handleErrors(execute);
});
//# sourceMappingURL=index.js.map