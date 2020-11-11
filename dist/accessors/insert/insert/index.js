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
exports.insert = void 0;
const services_1 = require("../../../services");
const { wrapSqlInTryCatch } = require('../../../handle-error');
const createValueString = (input) => {
    const values = Object.values(input);
    return `(${values.map((_, i) => `$${i + 1}`).join(', ')})`;
};
const createKeyString = (input, translator) => {
    const keys = Object.keys(input);
    return `(${keys.map(key => translator.objToRel(key)).join(', ')})`;
};
exports.insert = ({ pool, translator, }) => ({ entity, input }) => __awaiter(void 0, void 0, void 0, function* () {
    if (entity === null || entity === undefined) {
        throw new Error('entity was not provided for insert operation.');
    }
    if (input === null || input === undefined) {
        throw new Error(`input was not provided for insert operation (entity: ${entity}).`);
    }
    const queryString = `
    INSERT INTO "${translator.objToRel(entity)}" ${createKeyString(input, translator)}
    VALUES ${createValueString(input)}
    RETURNING *
  `;
    try {
        const response = yield services_1.query({
            params: Object.values(input),
            queryString,
            pool,
        });
        return services_1.format(response, translator)[0];
    }
    catch (e) {
        if (e.message.includes('conflicted with the FOREIGN KEY constraint')) {
            let table = 'table';
            try {
                table = e.message.split('table "')[1].split('"')[0];
            }
            catch (error) {
                console.log('Couldn\'t match table from error message.');
            }
            throw new Error(`Insert for ${entity} failed: reference to entry in ${table} that does not exist.`);
        }
        throw new Error(`${entity} insertion failed: ${e.message}`);
    }
});
//# sourceMappingURL=index.js.map