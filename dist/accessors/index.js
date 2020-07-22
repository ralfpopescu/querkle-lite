"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessors = void 0;
const insert_1 = require("./insert");
const get_1 = require("./get");
const remove_1 = require("./remove");
const update_1 = require("./update");
const execute_sql_1 = require("./execute-sql");
var get_2 = require("./get");
Object.defineProperty(exports, "get", { enumerable: true, get: function () { return get_2.get; } });
Object.defineProperty(exports, "getBatchFunction", { enumerable: true, get: function () { return get_2.getBatchFunction; } });
var batch_sql_1 = require("./batch-sql");
Object.defineProperty(exports, "batchSql", { enumerable: true, get: function () { return batch_sql_1.batchSql; } });
Object.defineProperty(exports, "batchSqlFunction", { enumerable: true, get: function () { return batch_sql_1.batchSqlFunction; } });
exports.accessors = {
    getAll: get_1.getAll,
    getMultiple: get_1.getMultiple,
    executeSql: execute_sql_1.executeSql,
    insert: insert_1.insert,
    insertMany: insert_1.insertMany,
    remove: remove_1.remove,
    update: update_1.update,
};
//# sourceMappingURL=index.js.map