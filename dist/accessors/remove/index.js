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
exports.remove = void 0;
const services_1 = require("../../services");
const refetch_1 = __importDefault(require("../../services/refetch"));
exports.remove = ({ pool, translator, }) => ({ entity, where, is, multiple, }) => __awaiter(void 0, void 0, void 0, function* () {
    if (entity === null || entity === undefined) {
        throw new Error('entity was not provided for remove operation.');
    }
    if (where === null || where === undefined) {
        throw new Error(`'where' parameter was not provided for remove operation (entity: ${entity}).`);
    }
    if (is === null || is === undefined) {
        throw new Error(`'is' parameter was null or undefined for remove operation (entity: ${entity}).
    If intentionally want to delete where some field is null, please write custom SQL.`);
    }
    const queryString = `
    DELETE FROM "${translator.objToRel(entity)}"
    WHERE ${translator.objToRel(where)} = ?;
  `;
    const result = yield refetch_1.default([is], entity, pool, translator);
    if (result.length === 0) {
        throw new Error(`No delete made for ${entity} where ${where} is ${is}: row does not exist.`);
    }
    yield services_1.query({
        params: [is],
        queryString,
        pool,
    });
    return multiple ? result : result[0];
});
//# sourceMappingURL=index.js.map