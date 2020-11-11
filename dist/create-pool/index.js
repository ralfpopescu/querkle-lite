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
exports.createPoolConnectionString = exports.createPool = void 0;
const { Pool } = require('pg');
exports.createPool = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const envOptions = {
        host: "db",
        database: "querkledb",
        user: "querkleuser",
        password: "querklepass"
    };
    const coalescedOptions = Object.assign(Object.assign({}, envOptions), options);
    try {
        const pool = new Pool(coalescedOptions);
        const client = yield pool.connect();
        return client;
    }
    catch (e) {
        throw new Error(`Failed to create pool. ${e}`);
    }
});
exports.createPoolConnectionString = (conString) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = new Pool(conString);
        const client = yield pool.connect();
        return client;
    }
    catch (e) {
        throw new Error(`Failed to create pool. ${e}`);
    }
});
//# sourceMappingURL=index.js.map