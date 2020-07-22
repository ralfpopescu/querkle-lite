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
let quervana;
let pool;
let zooId;
let animalId;
const animals = [
    { name: 'Lion', quantity: 3 },
    { name: 'Penguin', quantity: 10 },
    { name: 'Monkey', quantity: 4 },
];
const model = {
    zoo: {
        id: { type: _1.sqlTypes.int, nullable: false },
        city: { type: _1.sqlTypes.varChar(50), nullable: true },
    },
    animal: {
        id: { type: _1.sqlTypes.int, nullable: false },
        name: { type: _1.sqlTypes.varChar(50), nullable: true },
        quantity: { type: _1.sqlTypes.int, nullable: true },
        zooId: { type: _1.sqlTypes.int, nullable: true },
    },
};
beforeAll((done) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Creating pool with config: ${config_1.default}`);
    pool = yield _1.createPool(config_1.default);
    console.log('Created pool.');
    console.log('Creating schema named test...');
    yield pool.request().query('CREATE SCHEMA test');
    console.log('Created schema test.');
    console.log('Creating schema named testtwo...');
    yield pool.request().query('CREATE SCHEMA testtwo');
    console.log('Created schema testtwo.');
    console.log('Creating table test.zoo...');
    yield pool.request().query(`
    CREATE TABLE test.zoo
    (
      id   integer IDENTITY
        CONSTRAINT pk_zoo PRIMARY KEY NOT NULL,
      city VARCHAR(50)
    );`);
    console.log('Created table test.zoo.');
    console.log('Creating table test.animal_info...');
    yield pool.request().query(`
    CREATE TABLE test.animal_info
    (
      id          integer IDENTITY
        CONSTRAINT pk_animal_info PRIMARY KEY NOT NULL,
      description VARCHAR(50)
    );`);
    console.log('Created table test.animal_info.');
    console.log('Creating table test.animal...');
    yield pool.request().query(`
    CREATE TABLE test.animal
    (
      id             integer IDENTITY
        CONSTRAINT pk_animal PRIMARY KEY NOT NULL,
      name           VARCHAR(50),
      quantity       integer,
      animal_info_id integer REFERENCES test.animal_info (id),
      zoo_id         integer REFERENCES test.zoo (id)
    );`);
    console.log('Created table test.animal.');
    console.log('Creating table testtwo.animal...');
    yield pool.request().query(`
    CREATE TABLE testtwo.animal
    (
      id       integer IDENTITY
        CONSTRAINT pk_animal PRIMARY KEY NOT NULL,
      name     VARCHAR(50),
      quantity integer,
      zoo_id   integer REFERENCES test.zoo (id)
    );`);
    console.log('Created table testtwo.animal.');
    const generatedModel = yield _1.generateModel(pool, 'test');
    quervana = _1.initQuervana(pool, 'test', generatedModel);
    done();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield pool.close();
}));
const modelMatcher = (testModel, quervanaModel) => (table, param) => {
    expect_1.default(testModel[table][param].type).toEqual(quervanaModel[table][param].type);
    expect_1.default(testModel[table][param].nullable).toEqual(quervanaModel[table][param].nullable);
};
test('should generate model and not include from schema testtwo', () => __awaiter(void 0, void 0, void 0, function* () {
    const matchModels = modelMatcher(model, quervana.model);
    matchModels('zoo', 'id');
    matchModels('zoo', 'city');
    matchModels('animal', 'id');
    matchModels('animal', 'name');
    matchModels('animal', 'quantity');
    matchModels('animal', 'zooId');
}));
test('should fail to generate model', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield _1.generateModel(pool, 'testthree');
    }
    catch (e) {
        expect_1.default(e.message).toBe('Schema testthree provided no model. Available schemas: ["test","testtwo"]');
    }
}));
test('should be case insensitive to schema name', () => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.generateModel(pool, 'TEST');
}));
test('should succeed: insert zoo', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.insert({ entity: 'zoo', input: { city: 'Atlanta' } });
    expect_1.default(response.id).toBeDefined();
    expect_1.default(response.city).toEqual('Atlanta');
    zooId = response.id;
}));
test('should succeed: get zoo city', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.get({
        entity: 'zoo', where: 'id', is: 1, returnField: 'city',
    });
    expect_1.default(response).toEqual('Atlanta');
}));
test('should succeed: get zoo city that does not exist should return null', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.get({
        entity: 'zoo', where: 'id', is: 20,
    });
    expect_1.default(response).toEqual(null);
}));
test('should succeed: null result should still be transformed', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.get({
        entity: 'zoo', where: 'id', is: 20, transform: result => (result === null ? 'true' : 'false'),
    });
    expect_1.default(response).toEqual('true');
}));
test('should succeed: null results should still be transformed', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.get({
        entity: 'zoo',
        where: 'id',
        is: 20,
        multiple: true,
        transformMultiple: results => (results.length === 0 ? 'true' : 'false'),
    });
    expect_1.default(response).toEqual('true');
}));
test('should succeed: get with transform', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.get({
        entity: 'zoo', where: 'id', is: 1, transform: (result) => ({ city: result.city.toUpperCase() }),
    });
    expect_1.default(response.city).toEqual('ATLANTA');
}));
test('should succeed: update zoo', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.update({
        entity: 'zoo', input: { city: 'Boston' }, where: 'id', is: zooId,
    });
    expect_1.default(response.city).toEqual('Boston');
}));
test('should succeed: insert animal referencing zoo', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.insert({
        entity: 'animal',
        input: { zooId, name: 'Tiger', quantity: 2 },
    });
    expect_1.default(response.zooId).toEqual(zooId);
    expect_1.default(response.name).toEqual('Tiger');
    expect_1.default(response.quantity).toEqual(2);
    animalId = response.id;
}));
test('should succeed: delete Tiger', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.remove({ entity: 'animal', where: 'id', is: animalId });
    expect_1.default(response.zooId).toEqual(zooId);
    expect_1.default(response.name).toEqual('Tiger');
    expect_1.default(response.quantity).toEqual(2);
}));
test('should succeed: insert many animals', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.insertMany({
        entity: 'animal',
        inputArray: animals.map(animal => (Object.assign(Object.assign({}, animal), { zooId }))),
    });
    expect_1.default(response.length).toBe(3);
}));
test('should succeed: get all animals', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.getAll({ entity: 'animal' });
    expect_1.default(response.length).toBe(3);
}));
test('should succeed: get multiple animals', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.getMultiple({ entity: 'animal', where: 'id', isIn: [2, 3, 4] });
    expect_1.default(response.length).toBe(3);
}));
test('should succeed: insert animal even though null value', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.insert({
        entity: 'animal',
        input: { zooId, name: 'Turtle', quantity: null },
    });
    expect_1.default(response.id).toBeDefined();
    expect_1.default(response.name).toEqual('Turtle');
}));
test('should batch gets', () => __awaiter(void 0, void 0, void 0, function* () {
    const t0 = Date.now();
    yield Promise.all([quervana.executeSql({ queryString: 'SELECT * FROM test.animal WHERE id = 2' }),
        quervana.executeSql({ queryString: 'SELECT * FROM test.animal WHERE id = 3' }),
        quervana.executeSql({ queryString: 'SELECT * FROM test.animal WHERE id = 4' })]);
    const t1 = Date.now();
    const diffTime1 = Math.abs((t1 - t0) / 1000);
    const t2 = Date.now();
    yield Promise.all([
        quervana.get({ entity: 'animal', where: 'id', is: 2 }),
        quervana.get({ entity: 'animal', where: 'id', is: 3 }),
        quervana.get({ entity: 'animal', where: 'id', is: 4 }),
    ]);
    const t3 = Date.now();
    const diffTime2 = Math.abs(t3 - t2) / 1000;
    expect_1.default(diffTime1).toBeGreaterThan(diffTime2);
}));
test('should throw: insert a non-defined entity', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield quervana.insert({ entity: 'critter', input: { zooId, name: 'Squirrel' } });
    }
    catch (e) {
        expect_1.default(e.message).toMatch('Model for critter is not defined.');
    }
}));
test('should throw: inputs are not equal', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield quervana.insertMany({
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
        yield quervana.insertMany({
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
        yield quervana.insertMany({
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
test('batch sql - get cities animals are in', () => __awaiter(void 0, void 0, void 0, function* () {
    const newZoo = yield quervana.insert({ entity: 'zoo', input: { city: 'Batchville' } });
    yield quervana.insertMany({
        entity: 'animal',
        inputArray: [
            // Ignored so TS will let us do bad things.
            // @ts-ignore
            { name: 'Pidgeon', quantity: null, zooId: newZoo.id },
            // @ts-ignore
            { name: 'Hippo', quantity: 1, zooId: newZoo.id },
        ],
    });
    const allAnimals = yield quervana.getAll({ entity: 'animal ' });
    const allAnimalsWithZoos = allAnimals.filter(animal => !!animal.zooId);
    const zooIds = [...new Set(allAnimalsWithZoos.map(animal => animal.zooId))];
    const animalsByZooId = zooIds
        .map((zId) => ({
        [zId]: allAnimalsWithZoos
            .filter(animal => animal.zooId === zId),
    })).reduce((acc, curr) => (Object.assign(Object.assign({}, acc), curr)));
    const queryString = `
    SELECT test.animal.id,
           test.animal.name,
           test.zoo.id AS zoo_id,
           test.zoo.city
    FROM test.animal
           JOIN test.zoo ON test.animal.zoo_id = test.zoo.id
    WHERE test.zoo.id IN [BATCH]`;
    const results = yield Promise.all([
        quervana.batchSql({
            queryString,
            addToBatch: 0,
            batchEntity: 'zoo',
            batchParam: 'id',
            multiple: true,
        }),
        quervana.batchSql({
            queryString,
            addToBatch: 1,
            batchEntity: 'zoo',
            batchParam: 'id',
            multiple: true,
        }),
        quervana.batchSql({
            queryString,
            addToBatch: 2,
            batchEntity: 'zoo',
            batchParam: 'id',
            multiple: true,
        })
    ]);
    matchResults(results[0], animalsByZooId['0']);
    matchResults(results[1], animalsByZooId['1']);
    matchResults(results[2], animalsByZooId['2']);
}));
test('should succeed: get with transform multiple', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.get({
        entity: 'animal',
        where: 'zooId',
        is: 1,
        multiple: true,
        transformMultiple: rs => rs.reduce((acc, curr) => `${acc}${curr.name}`, ''),
    });
    expect_1.default(response).toEqual('LionPenguinMonkeyTurtle');
}));
test('batch sql - get all animals per city', () => __awaiter(void 0, void 0, void 0, function* () {
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
    SELECT test.animal.id,
           test.animal.name,
           test.zoo.id AS zoo_id,
           test.zoo.city
    FROM test.animal
           JOIN test.zoo
                ON test.animal.zoo_id = test.zoo.id
    WHERE test.zoo.city IN [BATCH]`;
    const results = yield Promise.all([
        quervana.batchSql({
            queryString,
            addToBatch: 'Batchville',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
        }),
        quervana.batchSql({
            queryString,
            addToBatch: 'Boston',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
        }),
        quervana.batchSql({
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
    SELECT test.animal.id,
           test.animal.name,
           test.zoo.id AS zoo_id,
           test.zoo.city
    FROM test.animal
           JOIN test.zoo
                ON test.animal.zoo_id = test.zoo.id
    WHERE test.zoo.city IN [BATCH]`;
    const results = yield Promise.all([
        quervana.batchSql({
            queryString,
            addToBatch: 'Batchville',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
            parameterize: false,
        }),
        quervana.batchSql({
            queryString,
            addToBatch: 'Boston',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
            parameterize: false,
        }),
        quervana.batchSql({
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
    SELECT test.animal.id,
           test.animal.name,
           test.zoo.id AS zoo_id,
           test.zoo.city
    FROM test.animal
           JOIN test.zoo
                ON test.animal.zoo_id = test.zoo.id
    WHERE test.zoo.city IN [BATCH]`;
    const queryString2 = `
    SELECT test.animal.id,
           test.animal.name,
           test.zoo.id AS zoo_id,
           test.zoo.city
    FROM test.animal
           JOIN test.zoo ON test.animal.zoo_id = test.zoo.id
    WHERE test.zoo.id IN [BATCH]`;
    const results = yield Promise.all([
        quervana.batchSql({
            queryString: queryString1,
            addToBatch: 'Batchville',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
        }),
        quervana.batchSql({
            queryString: queryString1,
            addToBatch: 'Boston',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
        }),
        quervana.batchSql({
            queryString: queryString2,
            addToBatch: 0,
            batchEntity: 'zoo',
            batchParam: 'id',
            multiple: true,
        }),
        quervana.batchSql({
            queryString: queryString2,
            addToBatch: 1,
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
    SELECT test.animal.id,
           test.animal.name,
           test.zoo.id AS zoo_id,
           test.zoo.city
    FROM test.animal
           JOIN test.zoo
                ON test.animal.zoo_id = test.zoo.id
    WHERE test.zoo.city IN [BATCH]`;
    const queryString2 = `
    SELECT test.animal.id,
           test.animal.name,
           test.zoo.id AS zoo_id,
           test.zoo.city
    FROM test.animal
           JOIN test.zoo ON test.animal.zoo_id = test.zoo.id
    WHERE test.zoo.id IN [BATCH]`;
    const results = yield Promise.all([
        quervana.batchSql({
            queryString: queryString1,
            addToBatch: 'Batchville',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
            transform: (result) => (Object.assign(Object.assign({}, result), { city: 'OVERRIDDEN CITY' })),
        }),
        quervana.batchSql({
            queryString: queryString1,
            addToBatch: 'Boston',
            batchEntity: 'zoo',
            batchParam: 'city',
            multiple: true,
            transformMultiple: (rs) => rs.reduce((acc, curr) => `${acc}${curr.name}`, ''),
        }),
        quervana.batchSql({
            queryString: queryString2,
            addToBatch: 0,
            batchEntity: 'zoo',
            batchParam: 'id',
            multiple: true,
        }),
        quervana.batchSql({
            queryString: queryString2,
            addToBatch: 1,
            batchEntity: 'zoo',
            batchParam: 'id',
            multiple: true,
            transform: (result) => (Object.assign(Object.assign({}, result), { zooId: result.zooId * 1000 })),
        })
    ]);
    matchResults(results[0], expected[0]);
    expect_1.default(results[1]).toEqual(expected[1]);
    matchResults(results[2], expected[2]);
    matchResults(results[3], expected[3]);
}));
test('execute sql', () => __awaiter(void 0, void 0, void 0, function* () {
    const queryString = `
    SELECT test.animal.id,
           test.animal.name,
           test.zoo.id AS zoo_id,
           test.zoo.city
    FROM test.animal
           JOIN test.zoo
                ON test.animal.zoo_id = test.zoo.id
    WHERE test.zoo.city IN (@one, @two, @three)`;
    const zooParamTypes = quervana.getParamTypes({ entity: 'zoo', params: ['city'] });
    const params = { one: 'Batchville', two: 'Boston', three: 'Random' };
    const paramTypes = Object.keys(params).map(param => ({ [param]: zooParamTypes.city }))
        .reduce((acc, curr) => (Object.assign(Object.assign({}, acc), curr)));
    const results = yield quervana.executeSql({
        queryString, params, paramTypes, multiple: true,
    });
    expect_1.default(results.length).toBeGreaterThan(0);
}));
test('should succeed: insert many animals and return them', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield quervana.insertMany({
        returnInserted: true,
        entity: 'animal',
        inputArray: animals.map(animal => (Object.assign(Object.assign({}, animal), { zooId }))),
    });
    const firstAnimal = response[0];
    expect_1.default(firstAnimal.id).toBeDefined();
}));
//# sourceMappingURL=test.js.map