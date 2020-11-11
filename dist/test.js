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
const expect_1 = __importDefault(require("expect"));
const lodash_1 = __importDefault(require("lodash"));
const _1 = require(".");
const config_1 = __importDefault(require("./test-setup/config"));
require('iconv-lite').encodingExists('CP1252');
let querkle;
let pool;
let zooId;
let animalId;
const animals = [
    { name: 'Lion', quantity: 3 },
    { name: 'Penguin', quantity: 10 },
    { name: 'Monkey', quantity: 4 },
];
var conString = "postgres://querkleuser:querklepass@127.0.0.1:5432/querkledb";
const dbOptions = {
    host: "querkledb",
    database: "qdb",
    user: "quser",
    password: "qpass"
};
beforeAll((done) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Creating pool with config: ${config_1.default}`);
    pool = yield _1.createPool(dbOptions);
    console.log('Created pool.');
    console.log('Creating uuid extension...');
    yield pool.query(`
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `);
    console.log('Created uuid extention.');
    console.log('Creating table zoo...');
    yield pool.query(`
    CREATE TABLE IF NOT EXISTS zoo
    (
      id   uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
      city text
    );
    
    `);
    console.log('Created table zoo.');
    console.log('Creating table animal_info...');
    yield pool.query(`
    CREATE TABLE IF NOT EXISTS animal_info
    (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
      description text
    );
    
    `);
    console.log('Created table animal_info.');
    console.log('Creating table animal...');
    yield pool.query(`
    CREATE TABLE IF NOT EXISTS animal
    (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
      name           text,
      quantity       integer,
      animal_info_id uuid REFERENCES animal_info (id),
      zoo_id         uuid REFERENCES zoo (id)
    );

    TRUNCATE animal CASCADE;
    
    `);
    console.log('Created table animal.');
    querkle = _1.initQuerkle(pool);
    done();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    if (pool) {
        yield pool.end();
    }
}));
const nonexistantUuid = 'f216668e-883e-430f-bb84-7e50ea7629e1';
test('should succeed: insert zoo', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.insert({ entity: 'zoo', input: { city: 'Atlanta' } });
    expect_1.default(response.id).toBeDefined();
    expect_1.default(response.city).toEqual('Atlanta');
    zooId = response.id;
}));
test('should succeed: get zoo city', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.get({
        entity: 'zoo', where: 'id', is: zooId, returnField: 'city',
    });
    expect_1.default(response).toEqual('Atlanta');
}));
test('should succeed: get zoo city that does not exist should return null', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.get({
        entity: 'zoo', where: 'id', is: nonexistantUuid,
    });
    expect_1.default(response).toEqual(null);
}));
test('should succeed: null result should still be transformed', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.get({
        entity: 'zoo', where: 'id', is: nonexistantUuid,
        transform: result => (result === null ? 'true' : 'false'),
    });
    expect_1.default(response).toEqual('true');
}));
test('should succeed: null results should still be transformed', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.get({
        entity: 'zoo',
        where: 'id',
        is: nonexistantUuid,
        multiple: true,
        transformMultiple: results => (results.length === 0 ? 'true' : 'false'),
    });
    expect_1.default(response).toEqual('true');
}));
test('should succeed: get with transform', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.get({
        entity: 'zoo', where: 'id', is: zooId, transform: (result) => ({ city: result.city.toUpperCase() }),
    });
    expect_1.default(response.city).toEqual('ATLANTA');
}));
test('should succeed: update zoo', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.update({
        entity: 'zoo', input: { city: 'Boston' }, where: 'id', is: zooId,
    });
    expect_1.default(response.city).toEqual('Boston');
}));
test('should succeed: insert animal referencing zoo', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.insert({
        entity: 'animal',
        input: { zooId, name: 'Tiger', quantity: 2 },
    });
    expect_1.default(response.zooId).toEqual(zooId);
    expect_1.default(response.name).toEqual('Tiger');
    expect_1.default(response.quantity).toEqual(2);
    animalId = response.id;
}));
test('should succeed: delete Tiger', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.remove({ entity: 'animal', where: 'id', is: animalId });
    expect_1.default(response.zooId).toEqual(zooId);
    expect_1.default(response.name).toEqual('Tiger');
    expect_1.default(response.quantity).toEqual(2);
}));
let insertedAnimalsIds = [];
test('should succeed: insert many animals', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.insertMany({
        entity: 'animal',
        inputArray: animals.map(animal => (Object.assign(Object.assign({}, animal), { zooId }))),
    });
    insertedAnimalsIds = response.map(insertedAnimal => insertedAnimal.id);
    expect_1.default(response.length).toBe(3);
}));
test('should succeed: get all animals', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.getAll({ entity: 'animal' });
    expect_1.default(response.length).toBe(3);
}));
test('should succeed: get multiple animals', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.getMultiple({ entity: 'animal', where: 'id', isIn: insertedAnimalsIds });
    expect_1.default(response.length).toBe(3);
}));
test('should succeed: insert animal even though null value', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.insert({
        entity: 'animal',
        input: { zooId, name: 'Turtle', quantity: null },
    });
    expect_1.default(response.id).toBeDefined();
    expect_1.default(response.name).toEqual('Turtle');
}));
test('should batch gets', () => __awaiter(void 0, void 0, void 0, function* () {
    const t0 = Date.now();
    yield Promise.all([querkle.executeSql({ queryString: `SELECT * FROM animal WHERE id = '${insertedAnimalsIds[0]}'` }),
        querkle.executeSql({ queryString: `SELECT * FROM animal WHERE id = '${insertedAnimalsIds[1]}'` }),
        querkle.executeSql({ queryString: `SELECT * FROM animal WHERE id = '${insertedAnimalsIds[2]}'` })]);
    const t1 = Date.now();
    const diffTime1 = Math.abs((t1 - t0) / 1000);
    const t2 = Date.now();
    yield Promise.all([
        querkle.get({ entity: 'animal', where: 'id', is: insertedAnimalsIds[0] }),
        querkle.get({ entity: 'animal', where: 'id', is: insertedAnimalsIds[1] }),
        querkle.get({ entity: 'animal', where: 'id', is: insertedAnimalsIds[2] }),
    ]);
    const t3 = Date.now();
    const diffTime2 = Math.abs(t3 - t2) / 1000;
    expect_1.default(diffTime1).toBeGreaterThan(diffTime2);
}));
test('should throw: insert a non-defined entity', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield querkle.insert({ entity: 'critter', input: { zooId, name: 'Squirrel' } });
    }
    catch (e) {
        expect_1.default(e.message).toMatch('critter insertion failed: relation \"critter\" does not exist');
    }
}));
test('should throw: inputs are not equal', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield querkle.insertMany({
            entity: 'animal',
            inputArray: [
                { name: 'Squirrel' },
                { name: 'Elephant', quantity: 1 },
            ],
        });
    }
    catch (e) {
        expect_1.default(e.message).toMatch('All elements of input array need to have the same keys (entity: animal).');
    }
}));
test('should throw: variables not provided', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ignored so TS will let us do bad things.
        // @ts-ignore
        yield querkle.insertMany({
            inputArray: [
                { name: 'Squirrel' },
                { name: 'Elephant', quantity: 1 },
            ],
        });
    }
    catch (e) {
        expect_1.default(e.message).toMatch('entity was not provided for insertMany operation.');
    }
    try {
        yield querkle.insertMany({
            entity: 'animal',
            // Ignored so TS will let us do bad things.
            // @ts-ignore
            input: [
                { name: 'Squirrel' },
                { name: 'Elephant', quantity: 1 },
            ],
        });
    }
    catch (e) {
        expect_1.default(e.message).toMatch('inputArray was not provided for insertMany operation (entity: animal).');
    }
}));
const matchResults = (result, animalsToMatch) => {
    if (!animalsToMatch) {
        expect_1.default(result).toEqual([]);
    }
    else {
        lodash_1.default.isEqual(result.sort(), animalsToMatch.sort());
    }
};
let newZoo;
test('batch sql - get cities animals are in', () => __awaiter(void 0, void 0, void 0, function* () {
    newZoo = yield querkle.insert({ entity: 'zoo', input: { city: 'Batchville' } });
    yield querkle.insertMany({
        entity: 'animal',
        inputArray: [
            // Ignored so TS will let us do bad things.
            // @ts-ignore
            { name: 'Pidgeon', quantity: null, zooId: newZoo.id },
            // @ts-ignore
            { name: 'Hippo', quantity: 1, zooId: newZoo.id },
        ],
    });
    const allAnimals = yield querkle.getAll({ entity: 'animal' });
    const allAnimalsWithZoos = allAnimals.filter(animal => !!animal.zooId);
    const zooIds = [...new Set(allAnimalsWithZoos.map(animal => animal.zooId))];
    const animalsByZooId = zooIds
        .map((zId) => ({
        [zId]: allAnimalsWithZoos
            .filter(animal => animal.zooId === zId),
    })).reduce((acc, curr) => (Object.assign(Object.assign({}, acc), curr)));
    const queryString = `
    SELECT animal.id,
           animal.name,
           zoo.id AS zoo_id,
           zoo.city
    FROM animal
           JOIN zoo ON animal.zoo_id = zoo.id
    WHERE zoo.id IN [BATCH]`;
    const results = yield Promise.all([
        querkle.batchSql({
            queryString,
            addToBatch: zooId,
            batchEntity: 'zoo',
            batchParam: 'id',
            multiple: true,
        }),
        querkle.batchSql({
            queryString,
            addToBatch: zooId,
            batchEntity: 'zoo',
            batchParam: 'id',
            multiple: true,
        }),
        querkle.batchSql({
            queryString,
            addToBatch: newZoo.id,
            batchEntity: 'zoo',
            batchParam: 'id',
            multiple: true,
        })
    ]);
    matchResults(results[0], animalsByZooId[zooId]);
    matchResults(results[1], animalsByZooId[zooId]);
    matchResults(results[2], animalsByZooId[newZoo.id]);
}));
test('should succeed: get with transform multiple', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.get({
        entity: 'animal',
        where: 'zooId',
        is: zooId,
        multiple: true,
        transformMultiple: rs => rs.reduce((acc, curr) => `${acc}${curr.name}`, ''),
    });
    expect_1.default(response).toEqual('LionPenguinMonkeyTurtle');
}));
test('batch sql - get all animals per city', () => __awaiter(void 0, void 0, void 0, function* () {
    const expected = [
        [
            {
                id: 6, name: 'Pidgeon', zooId: newZoo.id, city: 'Batchville',
            },
            {
                id: 7, name: 'Hippo', zooId: newZoo.id, city: 'Batchville',
            },
        ],
        [
            {
                id: 2, name: 'Lion', zooId, city: 'Boston',
            },
            {
                id: 3, name: 'Penguin', zooId, city: 'Boston',
            },
            {
                id: 4, name: 'Monkey', zooId, city: 'Boston',
            },
            {
                id: 5, name: 'Turtle', zooId, city: 'Boston',
            },
        ],
        [],
    ];
    const queryString = `
    SELECT animal.id,
           animal.name,
           zoo.id AS zoo_id,
           zoo.city
    FROM animal
           JOIN zoo
                ON animal.zoo_id = zoo.id
    WHERE zoo.city IN [BATCH]`;
    const results = yield Promise.all([
        querkle.batchSql({
            queryString,
            addToBatch: 'Batchville',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
        }),
        querkle.batchSql({
            queryString,
            addToBatch: 'Boston',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
        }),
        querkle.batchSql({
            queryString,
            addToBatch: 'Random',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
        })
    ]);
    matchResults(results[0], expected[0]);
    matchResults(results[1], expected[1]);
    matchResults(results[2], expected[2]);
}));
test('batch sql - parameterize off', () => __awaiter(void 0, void 0, void 0, function* () {
    const expected = [
        [
            {
                id: 6, name: 'Pidgeon', zooId: 2, city: 'Batchville',
            },
            {
                id: 7, name: 'Hippo', zooId: 2, city: 'Batchville',
            },
        ],
        [
            {
                id: 2, name: 'Lion', zooId: 1, city: 'Boston',
            },
            {
                id: 3, name: 'Penguin', zooId: 1, city: 'Boston',
            },
            {
                id: 4, name: 'Monkey', zooId: 1, city: 'Boston',
            },
            {
                id: 5, name: 'Turtle', zooId: 1, city: 'Boston',
            },
        ],
        [],
    ];
    const queryString = `
    SELECT animal.id,
           animal.name,
           zoo.id AS zoo_id,
           zoo.city
    FROM animal
           JOIN zoo
                ON animal.zoo_id = zoo.id
    WHERE zoo.city IN [BATCH]`;
    const results = yield Promise.all([
        querkle.batchSql({
            queryString,
            addToBatch: 'Batchville',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
            parameterize: false,
        }),
        querkle.batchSql({
            queryString,
            addToBatch: 'Boston',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
            parameterize: false,
        }),
        querkle.batchSql({
            queryString,
            addToBatch: 'Random',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
            parameterize: false,
        })
    ]);
    matchResults(results[0], expected[0]);
    matchResults(results[1], expected[1]);
    matchResults(results[2], expected[2]);
}));
test('batch sql - different queries', () => __awaiter(void 0, void 0, void 0, function* () {
    const expected = [
        [
            {
                id: 6, name: 'Pidgeon', zooId: 2, city: 'Batchville',
            },
            {
                id: 7, name: 'Hippo', zooId: 2, city: 'Batchville',
            },
        ],
        [
            {
                id: 2, name: 'Lion', zooId: 1, city: 'Boston',
            },
            {
                id: 3, name: 'Penguin', zooId: 1, city: 'Boston',
            },
            {
                id: 4, name: 'Monkey', zooId: 1, city: 'Boston',
            },
            {
                id: 5, name: 'Turtle', zooId: 1, city: 'Boston',
            },
        ],
        [],
        [
            {
                id: 2, name: 'Lion', zooId: 1, city: 'Boston',
            },
            {
                id: 3, name: 'Penguin', zooId: 1, city: 'Boston',
            },
            {
                id: 4, name: 'Monkey', zooId: 1, city: 'Boston',
            },
            {
                id: 5, name: 'Turtle', zooId: 1, city: 'Boston',
            },
        ],
    ];
    const queryString1 = `
    SELECT animal.id,
           animal.name,
           zoo.id AS zoo_id,
           zoo.city
    FROM animal
           JOIN zoo
                ON animal.zoo_id = zoo.id
    WHERE zoo.city IN [BATCH]`;
    const queryString2 = `
    SELECT animal.id,
           animal.name,
           zoo.id AS zoo_id,
           zoo.city
    FROM animal
           JOIN zoo ON animal.zoo_id = zoo.id
    WHERE zoo.id IN [BATCH]`;
    const results = yield Promise.all([
        querkle.batchSql({
            queryString: queryString1,
            addToBatch: 'Batchville',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
        }),
        querkle.batchSql({
            queryString: queryString1,
            addToBatch: 'Boston',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
        }),
        querkle.batchSql({
            queryString: queryString2,
            addToBatch: zooId,
            batchEntity: 'zoo',
            batchParam: 'id',
            multiple: true,
        }),
        querkle.batchSql({
            queryString: queryString2,
            addToBatch: newZoo.id,
            batchEntity: 'zoo',
            batchParam: 'id',
            multiple: true,
        })
    ]);
    matchResults(results[0], expected[0]);
    matchResults(results[1], expected[1]);
    matchResults(results[2], expected[2]);
    matchResults(results[3], expected[3]);
}));
test('batch sql - different queries with transforms', () => __awaiter(void 0, void 0, void 0, function* () {
    const expected = [
        [
            {
                id: 6, name: 'Pidgeon', zooId: 2, city: 'OVERRIDDEN CITY',
            },
            {
                id: 7, name: 'Hippo', zooId: 2, city: 'OVERRIDDEN CITY',
            },
        ],
        'LionPenguinMonkeyTurtle',
        [],
        [
            {
                id: 2, name: 'Lion', zooId: 1000, city: 'Boston',
            },
            {
                id: 3, name: 'Penguin', zooId: 1000, city: 'Boston',
            },
            {
                id: 4, name: 'Monkey', zooId: 1000, city: 'Boston',
            },
            {
                id: 5, name: 'Turtle', zooId: 1000, city: 'Boston',
            },
        ],
    ];
    const queryString1 = `
    SELECT animal.id,
           animal.name,
           zoo.id AS zoo_id,
           zoo.city
    FROM animal
           JOIN zoo
                ON animal.zoo_id = zoo.id
    WHERE zoo.city IN [BATCH]`;
    const queryString2 = `
    SELECT animal.id,
           animal.name,
           zoo.id AS zoo_id,
           zoo.city
    FROM animal
           JOIN zoo ON animal.zoo_id = zoo.id
    WHERE zoo.id IN [BATCH]`;
    const results = yield Promise.all([
        querkle.batchSql({
            queryString: queryString1,
            addToBatch: 'Batchville',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
            transform: (result) => (Object.assign(Object.assign({}, result), { city: 'OVERRIDDEN CITY' })),
        }),
        querkle.batchSql({
            queryString: queryString1,
            addToBatch: 'Boston',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
            transformMultiple: (rs) => rs.reduce((acc, curr) => `${acc}${curr.name}`, ''),
        }),
        querkle.batchSql({
            queryString: queryString2,
            addToBatch: zooId,
            batchEntity: 'zoo',
            batchParam: 'id',
            multiple: true,
        }),
        querkle.batchSql({
            queryString: queryString2,
            addToBatch: newZoo.id,
            batchEntity: 'zoo',
            batchParam: 'id',
            multiple: true,
            transform: (result) => (Object.assign(Object.assign({}, result), { zooId: result.zooId[0] })),
        })
    ]);
    expect_1.default(results[0][0].city).toEqual('OVERRIDDEN CITY');
    expect_1.default(results[1]).toEqual(expected[1]);
    expect_1.default(results[3][0].zooId.length).toEqual(1);
}));
test('execute sql', () => __awaiter(void 0, void 0, void 0, function* () {
    const queryString = `
    SELECT animal.id,
           animal.name,
           zoo.id AS zoo_id,
           zoo.city
    FROM animal
           JOIN zoo
                ON animal.zoo_id = zoo.id
    WHERE zoo.city IN ($1, $2, $3)`;
    const params = ['Batchville', 'Boston', 'Random'];
    const results = yield querkle.executeSql({
        params, queryString, multiple: true,
    });
    expect_1.default(results.length).toBeGreaterThan(0);
}));
test('should succeed: insert many animals and return them', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield querkle.insertMany({
        entity: 'animal',
        inputArray: animals.map(animal => (Object.assign(Object.assign({}, animal), { zooId }))),
    });
    const firstAnimal = response[0];
    expect_1.default(firstAnimal.id).toBeDefined();
}));
//# sourceMappingURL=test.js.map