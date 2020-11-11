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
exports.getMultiple = ({ pool, translator, }) => ({ entity, where, isIn, }) => __awaiter(void 0, void 0, void 0, function* () {
    if (entity === null || entity === undefined) {
        throw new Error('entity was not provided for getMultiple operation.');
    }
    if (where === null || where === undefined) {
        throw new Error(`'where' parameter was not provided for getMultiple operation (entity: ${entity}).`);
    }
    if (!isIn) {
        throw new Error(`'isIn' parameter was not provided for getMultiple operation (entity: ${entity}).`);
    }
    if (!Array.isArray(isIn)) {
        throw new Error(`'isIn' parameter provided is not an array (entity: ${entity}).`);
    }
    const valueString = isIn.map((_, i) => `$${i + 1}`).join(', ');
    const queryString = `
    SELECT * FROM "${translator.objToRel(entity)}"
    WHERE ${translator.objToRel(where)} IN (${valueString});
  `;
    const response = yield services_1.query({
        queryString,
        params: isIn,
        pool,
    });
    return services_1.format(response, translator);
});
//# sourceMappingURL=index.js.map