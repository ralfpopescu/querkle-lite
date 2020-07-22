import { ConnectionPool } from 'mssql';
import expect from 'expect';
import _ from 'lodash';
import { createPool, generateModel, initQuervana, Quervana, sqlTypes } from '.';

import config from './test-setup/config';
import { ExcludeGeneratedColumns } from './accessors';

require('iconv-lite').encodingExists('CP1252');

type ZooRecord = {
  readonly id: number;
  readonly city: string;
}

type AnimalRecord = {
  readonly id: number;
  readonly name: string;
  readonly quantity: number | null;
  readonly animalInfoId?: number;
  readonly zooId?: number;
}

let quervana: Quervana;
let pool: ConnectionPool;
let zooId: number;
let animalId: number;

const animals = [
  { name: 'Lion', quantity: 3 },
  { name: 'Penguin', quantity: 10 },
  { name: 'Monkey', quantity: 4 },
];

const model = {
  zoo: {
    id: { type: sqlTypes.int, nullable: false },
    city: { type: sqlTypes.varChar(50), nullable: true },
  },
  animal: {
    id: { type: sqlTypes.int, nullable: false },
    name: { type: sqlTypes.varChar(50), nullable: true },
    quantity: { type: sqlTypes.int, nullable: true },
    zooId: { type: sqlTypes.int, nullable: true },
  },
};

beforeAll(async done => {
  console.log(`Creating pool with config: ${config}`);
  pool = await createPool(config);
  console.log('Created pool.');

  console.log('Creating schema named test...');
  await pool.request().query('CREATE SCHEMA test');
  console.log('Created schema test.');

  console.log('Creating schema named testtwo...');
  await pool.request().query('CREATE SCHEMA testtwo');
  console.log('Created schema testtwo.');

  console.log('Creating table test.zoo...');
  await pool.request().query(`
    CREATE TABLE test.zoo
    (
      id   integer IDENTITY
        CONSTRAINT pk_zoo PRIMARY KEY NOT NULL,
      city VARCHAR(50)
    );`);
  console.log('Created table test.zoo.');

  console.log('Creating table test.animal_info...');
  await pool.request().query(`
    CREATE TABLE test.animal_info
    (
      id          integer IDENTITY
        CONSTRAINT pk_animal_info PRIMARY KEY NOT NULL,
      description VARCHAR(50)
    );`);
  console.log('Created table test.animal_info.');

  console.log('Creating table test.animal...');
  await pool.request().query(`
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
  await pool.request().query(`
    CREATE TABLE testtwo.animal
    (
      id       integer IDENTITY
        CONSTRAINT pk_animal PRIMARY KEY NOT NULL,
      name     VARCHAR(50),
      quantity integer,
      zoo_id   integer REFERENCES test.zoo (id)
    );`);
  console.log('Created table testtwo.animal.');

  const generatedModel = await generateModel(pool, 'test');
  quervana = initQuervana(pool, 'test', generatedModel);
  done();

});

afterAll(async () => {
  await pool.close();
});

const modelMatcher = (testModel, quervanaModel) => (table, param) => {
  expect(testModel[table][param].type).toEqual(quervanaModel[table][param].type);
  expect(testModel[table][param].nullable).toEqual(quervanaModel[table][param].nullable);
};

test('should generate model and not include from schema testtwo', async () => {
  const matchModels = modelMatcher(model, quervana.model);
  matchModels('zoo', 'id');
  matchModels('zoo', 'city');

  matchModels('animal', 'id');
  matchModels('animal', 'name');
  matchModels('animal', 'quantity');
  matchModels('animal', 'zooId');
});

test('should fail to generate model', async () => {
  try {
    await generateModel(pool, 'testthree');
  } catch (e) {
    expect(e.message).toBe('Schema testthree provided no model. Available schemas: ["test","testtwo"]');
  }
});

test('should be case insensitive to schema name', async () => {
  await generateModel(pool, 'TEST');
});

test('should succeed: insert zoo', async () => {
  const response = await quervana.insert<ZooRecord>({ entity: 'zoo', input: { city: 'Atlanta' } });

  expect(response.id).toBeDefined();
  expect(response.city).toEqual('Atlanta');

  zooId = response.id;
});

test('should succeed: get zoo city', async () => {
  const response = await quervana.get<ZooRecord>({
    entity: 'zoo', where: 'id', is: 1, returnField: 'city',
  });
  expect(response).toEqual('Atlanta');
});

test('should succeed: get zoo city that does not exist should return null', async () => {
  const response = await quervana.get<ZooRecord>({
    entity: 'zoo', where: 'id', is: 20,
  });
  expect(response).toEqual(null);
});

test('should succeed: null result should still be transformed', async () => {
  const response = await quervana.get<ZooRecord>({
    entity: 'zoo', where: 'id', is: 20, transform: result => (result === null ? 'true' : 'false'),
  });
  expect(response).toEqual('true');
});

test('should succeed: null results should still be transformed', async () => {
  const response = await quervana.get<ZooRecord>({
    entity: 'zoo',
    where: 'id',
    is: 20,
    multiple: true,
    transformMultiple: results => (results.length === 0 ? 'true' : 'false'),
  });
  expect(response).toEqual('true');
});

test('should succeed: get with transform', async () => {
  const response = await quervana.get<ZooRecord>({
    entity: 'zoo', where: 'id', is: 1, transform: (result) => ({ city: result.city.toUpperCase() }),
  });
  expect(response.city).toEqual('ATLANTA');
});


test('should succeed: update zoo', async () => {
  const response = await quervana.update<ZooRecord>({
    entity: 'zoo', input: { city: 'Boston' }, where: 'id', is: zooId,
  });

  expect(response.city).toEqual('Boston');
});

test('should succeed: insert animal referencing zoo', async () => {
  const response = await quervana.insert<AnimalRecord>({
    entity: 'animal',
    input: { zooId, name: 'Tiger', quantity: 2 },
  });

  expect(response.zooId).toEqual(zooId);
  expect(response.name).toEqual('Tiger');
  expect(response.quantity).toEqual(2);

  animalId = response.id;
});

test('should succeed: delete Tiger', async () => {
  const response = await quervana.remove<AnimalRecord>({ entity: 'animal', where: 'id', is: animalId });

  expect(response.zooId).toEqual(zooId);
  expect(response.name).toEqual('Tiger');
  expect(response.quantity).toEqual(2);
});

test('should succeed: insert many animals', async () => {
  const response = await quervana.insertMany<AnimalRecord>({
    entity: 'animal',
    inputArray: animals.map(animal => ({ ...animal, zooId })),
  });
  expect(response.length).toBe(3);
});

test('should succeed: get all animals', async () => {
  const response = await quervana.getAll<AnimalRecord>({ entity: 'animal' });

  expect(response.length).toBe(3);
});

test('should succeed: get multiple animals', async () => {
  const response = await quervana.getMultiple<AnimalRecord>({ entity: 'animal', where: 'id', isIn: [2, 3, 4] });
  expect(response.length).toBe(3);
});

type Foo = ExcludeGeneratedColumns<AnimalRecord>;

test('should succeed: insert animal even though null value', async () => {
  const response = await quervana.insert<AnimalRecord>({
    entity: 'animal',
    input: { zooId, name: 'Turtle', quantity: null },
  });
  expect(response.id).toBeDefined();
  expect(response.name).toEqual('Turtle');
});

test('should batch gets', async () => {
  const t0 = Date.now();
  await Promise.all([quervana.executeSql({ queryString: 'SELECT * FROM test.animal WHERE id = 2' }),
    quervana.executeSql({ queryString: 'SELECT * FROM test.animal WHERE id = 3' }),
    quervana.executeSql({ queryString: 'SELECT * FROM test.animal WHERE id = 4' })]);
  const t1 = Date.now();
  const diffTime1 = Math.abs((t1 - t0) / 1000);
  const t2 = Date.now();
  await Promise.all([
    quervana.get<AnimalRecord>({ entity: 'animal', where: 'id', is: 2 }),
    quervana.get<AnimalRecord>({ entity: 'animal', where: 'id', is: 3 }),
    quervana.get<AnimalRecord>({ entity: 'animal', where: 'id', is: 4 }),
  ]);
  const t3 = Date.now();
  const diffTime2 = Math.abs(t3 - t2) / 1000;
  expect(diffTime1).toBeGreaterThan(diffTime2);
});

test('should throw: insert a non-defined entity', async () => {
  try {
    await quervana.insert({ entity: 'critter', input: { zooId, name: 'Squirrel' } });
  } catch (e) {
    expect(e.message).toMatch('Model for critter is not defined.');
  }
});

test('should throw: inputs are not equal', async () => {
  try {
    await quervana.insertMany<AnimalRecord>({
      entity: 'animal',
      inputArray: [
        { name: 'Squirrel' },
        { name: 'Elephant', quantity: 1 },
      ],
    });
  } catch (e) {
    expect(e.message).toMatch('All elements of input array need to have the same keys (entity: animal).');
  }
});

test('should throw: variables not provided', async () => {
  try {
    // Ignored so TS will let us do bad things.
    // @ts-ignore
    await quervana.insertMany<AnimalRecord>({
      inputArray: [
        { name: 'Squirrel' },
        { name: 'Elephant', quantity: 1 },
      ],
    });
  } catch (e) {
    expect(e.message).toMatch('entity was not provided for insertMany operation.');
  }
  try {
    await quervana.insertMany<AnimalRecord>({
      entity: 'animal',

      // Ignored so TS will let us do bad things.
      // @ts-ignore
      input: [
        { name: 'Squirrel' },
        { name: 'Elephant', quantity: 1 },
      ],
    });
  } catch (e) {
    expect(e.message).toMatch('inputArray was not provided for insertMany operation (entity: animal).');
  }
});

const matchResults = <T, R>(result: Array<T>, animalsToMatch: Array<R>) => {
  if (!animalsToMatch) {
    expect(result).toEqual([]);
  } else {
    _.isEqual(result.sort(), animalsToMatch.sort());
  }
};

test('batch sql - get cities animals are in', async () => {
  const newZoo = await quervana.insert({ entity: 'zoo', input: { city: 'Batchville' } });
  await quervana.insertMany<AnimalRecord>({
    entity: 'animal',
    inputArray: [
      // Ignored so TS will let us do bad things.
      // @ts-ignore
      { name: 'Pidgeon', quantity: null, zooId: newZoo.id },
      // @ts-ignore
      { name: 'Hippo', quantity: 1, zooId: newZoo.id },
    ],
  });

  const allAnimals = await quervana.getAll<AnimalRecord>({ entity: 'animal ' });
  const allAnimalsWithZoos = allAnimals.filter(animal => !!animal.zooId);
  const zooIds = [...new Set(allAnimalsWithZoos.map(animal => animal.zooId))];
  const animalsByZooId = zooIds
    .map((zId) => ({
      [zId]: allAnimalsWithZoos
        .filter(animal => animal.zooId === zId),
    })).reduce((acc, curr) => ({ ...acc, ...curr }));

  const queryString = `
    SELECT test.animal.id,
           test.animal.name,
           test.zoo.id AS zoo_id,
           test.zoo.city
    FROM test.animal
           JOIN test.zoo ON test.animal.zoo_id = test.zoo.id
    WHERE test.zoo.id IN [BATCH]`;
  const results = await Promise.all([
    quervana.batchSql<ZooRecord>({
      queryString,
      addToBatch: 0,
      batchEntity: 'zoo',
      batchParam: 'id',
      multiple: true,
    }),
    quervana.batchSql<ZooRecord>({
      queryString,
      addToBatch: 1,
      batchEntity: 'zoo',
      batchParam: 'id',
      multiple: true,
    }),
    quervana.batchSql<ZooRecord>({
      queryString,
      addToBatch: 2,
      batchEntity: 'zoo',
      batchParam: 'id',
      multiple: true,
    })]);

  matchResults(results[0], animalsByZooId['0']);
  matchResults(results[1], animalsByZooId['1']);
  matchResults(results[2], animalsByZooId['2']);
});

test('should succeed: get with transform multiple', async () => {
  const response = await quervana.get<AnimalRecord>({
    entity: 'animal',
    where: 'zooId',
    is: 1,
    multiple: true,
    transformMultiple: rs => rs.reduce((acc, curr) => `${acc}${curr.name}`, ''),
  });
  expect(response).toEqual('LionPenguinMonkeyTurtle');
});

test('batch sql - get all animals per city', async () => {
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
  const results = await Promise.all([
    quervana.batchSql<ZooRecord>({
      queryString,
      addToBatch: 'Batchville',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
    }),
    quervana.batchSql<ZooRecord>({
      queryString,
      addToBatch: 'Boston',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
    }),
    quervana.batchSql<ZooRecord>({
      queryString,
      addToBatch: 'Random',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
    })]);
  matchResults(results[0], expected[0]);
  matchResults(results[1], expected[1]);
  matchResults(results[2], expected[2]);
});

test('batch sql - parameterize off', async () => {
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

  const results = await Promise.all([
    quervana.batchSql<ZooRecord>({
      queryString,
      addToBatch: 'Batchville',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
      parameterize: false,
    }),
    quervana.batchSql<ZooRecord>({
      queryString,
      addToBatch: 'Boston',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
      parameterize: false,
    }),
    quervana.batchSql<ZooRecord>({
      queryString,
      addToBatch: 'Random',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
      parameterize: false,
    })]);

  matchResults(results[0], expected[0]);
  matchResults(results[1], expected[1]);
  matchResults(results[2], expected[2]);
});

test('batch sql - different queries', async () => {
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

  const results = await Promise.all([
    quervana.batchSql<ZooRecord>({
      queryString: queryString1,
      addToBatch: 'Batchville',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
    }),
    quervana.batchSql<ZooRecord>({
      queryString: queryString1,
      addToBatch: 'Boston',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
    }),
    quervana.batchSql<ZooRecord>({
      queryString: queryString2,
      addToBatch: 0,
      batchEntity: 'zoo',
      batchParam: 'id',
      multiple: true,
    }),
    quervana.batchSql<ZooRecord>({
      queryString: queryString2,
      addToBatch: 1,
      batchEntity: 'zoo',
      batchParam: 'id',
      multiple: true,
    })]);

  matchResults(results[0], expected[0]);
  matchResults(results[1], expected[1]);
  matchResults(results[2], expected[2]);
  matchResults(results[3], expected[3]);
});


test('batch sql - different queries with transforms', async () => {
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

  const results = await Promise.all([
    quervana.batchSql<ZooRecord>({
      queryString: queryString1,
      addToBatch: 'Batchville',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
      transform: (result) => ({ ...result, city: 'OVERRIDDEN CITY' }),
    }),
    quervana.batchSql<ZooRecord>({
      queryString: queryString1,
      addToBatch: 'Boston',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
      transformMultiple: (rs) => rs.reduce((acc, curr) => `${acc}${curr.name}`, ''),
    }),
    quervana.batchSql<ZooRecord>({
      queryString: queryString2,
      addToBatch: 0,
      batchEntity: 'zoo',
      batchParam: 'id',
      multiple: true,
    }),
    quervana.batchSql<ZooRecord>({
      queryString: queryString2,
      addToBatch: 1,
      batchEntity: 'zoo',
      batchParam: 'id',
      multiple: true,
      transform: (result: any) => ({ ...result, zooId: result.zooId * 1000 }),
    })]);

  matchResults(results[0], expected[0] as Array<object>);
  expect(results[1]).toEqual(expected[1]);
  matchResults(results[2], expected[2] as Array<object>);
  matchResults(results[3], expected[3] as Array<object>);
});

test('execute sql', async () => {
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
    .reduce((acc, curr) => ({ ...acc, ...curr }));
  const results = await quervana.executeSql({
    queryString, params, paramTypes, multiple: true,
  });
  expect(results.length).toBeGreaterThan(0);
});

test('should succeed: insert many animals and return them', async () => {
  const response = await quervana.insertMany<AnimalRecord>({
    returnInserted: true,
    entity: 'animal',
    inputArray: animals.map(animal => ({ ...animal, zooId })),
  });
  const firstAnimal = response[0];
  expect(firstAnimal.id).toBeDefined();
});
