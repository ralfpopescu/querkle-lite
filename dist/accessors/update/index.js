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
exports.update = void 0;
const services_1 = require("../../services");
const refetch_1 = __importDefault(require("../../services/refetch"));
const stringifyUpdates = (updatedFields, translator) => {
    const keys = Object.keys(updatedFields);
    const updates = keys.map((key, i) => `${translator.objToRel(key)} = ?`);
    return updates.join(',');
};
exports.update = ({ pool, translator, }) => ({ entity, input, where, is, multiple, }) => __awaiter(void 0, void 0, void 0, function* () {
    if (entity === null || entity === undefined) {
        throw new Error('entity was not provided for update operation.');
    }
    if (where === null || where === undefined) {
        throw new Error(`'where' parameter was not provided for update operation (entity: ${entity}).`);
    }
    if (input == null) {
        throw new Error(`'input' parameter was not provided for update operation (entity: ${entity}).`);
    }
    const numberOfColumnsToUpdate = Object.keys(input).length;
    const queryString = `UPDATE "${translator.objToRel(entity)}"
    SET ${stringifyUpdates(input, translator)}
    WHERE ${translator.objToRel(where)} = ?
  `;
    const values = Object.values(input);
    const response = yield services_1.query({
        params: [...values, is],
        queryString,
        pool,
    });
    if (response.rows.length === 0) {
        throw new Error(`No update made for ${entity} where ${where} is ${is}: row does not exist.`);
    }
    const result = refetch_1.default([is], entity, pool, translator);
    return multiple ? result : result[0];
});
module.exports = { update: exports.update };
//# sourceMappingURL=index.js.map