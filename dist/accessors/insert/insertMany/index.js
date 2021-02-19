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
const services_1 = require("../../../services");
const uuid_1 = require("uuid");
const refetch_1 = __importDefault(require("../../../services/refetch"));
const createKeyString = (obj, translator) => `(id, ${Object.keys(obj)
    .map(key => translator.objToRel(key)).join(', ')})`;
const createValuesString = (inputArray) => {
    const lengthOfOneInput = Object.keys(inputArray[0]).length;
    const numberOfInputs = inputArray.length;
    let arrayToAdd = [];
    const strArray = [];
    for (let i = 0; i < numberOfInputs; i += 1) {
        arrayToAdd = [];
        for (let j = 0; j < lengthOfOneInput; j += 1) {
            arrayToAdd.push(`?`);
        }
        strArray.push(arrayToAdd);
    }
    const str = strArray.map(valueArray => `(?, ${valueArray.join(', ')})`).join(', ');
    return str;
};
exports.insertMany = ({ pool, translator, }) => ({ entity, inputArray, }) => __awaiter(void 0, void 0, void 0, function* () {
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
    const queryString = `
  INSERT INTO "${translator.objToRel(entity)}" ${createKeyString(inputArray[0], translator)} 
  VALUES ${createValuesString(inputArray)}
`;
    const generatedIds = inputArray.map(() => uuid_1.v4());
    const params = inputArray.reduce((acc, curr, i) => [...acc, generatedIds[i], ...Object.values(curr)], []);
    yield services_1.query({ queryString, params, pool });
    const refetched = yield refetch_1.default(generatedIds, entity, pool, translator);
    return refetched;
});
//# sourceMappingURL=index.js.map