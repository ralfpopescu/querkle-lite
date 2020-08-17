import expect from 'expect';
import _ from 'lodash';
import { createPool, initQuerkle, Querkle } from '.';
import { createPoolConnectionString } from './create-pool'
import type { Pool } from 'pg'

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

let querkle: Querkle;
let pool: Pool;
let zooId: number;
let animalId: number;

const animals = [
  { name: 'Lion', quantity: 3 },
  { name: 'Penguin', quantity: 10 },
  { name: 'Monkey', quantity: 4 },
];

var conString = 
"postgres://querkleuser:querklepass@127.0.0.1:5432/querkledb";

const dbOptions = {
  host: "querkledb",
  database: "qdb",
  user: "quser",
  password: "qpass"
}

beforeAll(async done => {
  console.log(`Creating pool with config: ${config}`);
  pool = await createPool(dbOptions);
  console.log('Created pool.');


  console.log('Creating uuid extension...');
  await pool.query(`
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `);
  console.log('Created uuid extention.');


  console.log('Creating table zoo...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS zoo
    (
      id   uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
      city text
    );
    
    `);
  console.log('Created table zoo.');

  console.log('Creating table animal_info...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS animal_info
    (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
      description text
    );
    
    `);
  console.log('Created table animal_info.');

  console.log('Creating table animal...');
  await pool.query(`
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

  querkle = initQuerkle(pool);
  console.log('querklequerkle', querkle)
  done();

});

afterAll(async () => {
  if(pool) {
    await pool.end();
  }
});

const nonexistantUuid = 'f216668e-883e-430f-bb84-7e50ea7629e1'

test('should succeed: insert zoo', async () => {
  const response = await querkle.insert<ZooRecord>({ entity: 'zoo', input: { city: 'Atlanta' } });

  expect(response.id).toBeDefined();
  expect(response.city).toEqual('Atlanta');

  zooId = response.id;
});

test('should succeed: get zoo city', async () => {
  const response = await querkle.get<ZooRecord>({
    entity: 'zoo', where: 'id', is: zooId, returnField: 'city',
  });
  expect(response).toEqual('Atlanta');
});

test('should succeed: get zoo city that does not exist should return null', async () => {
  const response = await querkle.get<ZooRecord>({
    entity: 'zoo', where: 'id', is: nonexistantUuid,
  });
  expect(response).toEqual(null);
});

test('should succeed: null result should still be transformed', async () => {
  const response = await querkle.get<ZooRecord>({
    entity: 'zoo', where: 'id', is: nonexistantUuid, 
    transform: result => (result === null ? 'true' : 'false'),
  });
  expect(response).toEqual('true');
});

test('should succeed: null results should still be transformed', async () => {
  const response = await querkle.get<ZooRecord>({
    entity: 'zoo',
    where: 'id',
    is: nonexistantUuid,
    multiple: true,
    transformMultiple: results => (results.length === 0 ? 'true' : 'false'),
  });
  expect(response).toEqual('true');
});

test('should succeed: get with transform', async () => {
  const response = await querkle.get<ZooRecord>({
    entity: 'zoo', where: 'id', is: zooId, transform: (result) => ({ city: result.city.toUpperCase() }),
  });
  expect(response.city).toEqual('ATLANTA');
});


test('should succeed: update zoo', async () => {
  const response = await querkle.update<ZooRecord>({
    entity: 'zoo', input: { city: 'Boston' }, where: 'id', is: zooId,
  });

  expect(response.city).toEqual('Boston');
});

test('should succeed: insert animal referencing zoo', async () => {
  const response = await querkle.insert<AnimalRecord>({
    entity: 'animal',
    input: { zooId, name: 'Tiger', quantity: 2 },
  });

  expect(response.zooId).toEqual(zooId);
  expect(response.name).toEqual('Tiger');
  expect(response.quantity).toEqual(2);

  animalId = response.id;
});

test('should succeed: delete Tiger', async () => {
  const response = await querkle.remove<AnimalRecord>({ entity: 'animal', where: 'id', is: animalId });

  expect(response.zooId).toEqual(zooId);
  expect(response.name).toEqual('Tiger');
  expect(response.quantity).toEqual(2);
});

let insertedAnimalsIds = []

test('should succeed: insert many animals', async () => {
  const response = await querkle.insertMany<AnimalRecord>({
    entity: 'animal',
    inputArray: animals.map(animal => ({ ...animal, zooId })),
  });
  insertedAnimalsIds = response.map(insertedAnimal => insertedAnimal.id)
  expect(response.length).toBe(3);
});

test('should succeed: get all animals', async () => {
  const response = await querkle.getAll<AnimalRecord>({ entity: 'animal' });

  expect(response.length).toBe(3);
});

test('should succeed: get multiple animals', async () => {
  const response = await querkle.getMultiple<AnimalRecord>({ entity: 'animal', where: 'id', isIn: insertedAnimalsIds });
  expect(response.length).toBe(3);
});

type Foo = ExcludeGeneratedColumns<AnimalRecord>;

test('should succeed: insert animal even though null value', async () => {
  const response = await querkle.insert<AnimalRecord>({
    entity: 'animal',
    input: { zooId, name: 'Turtle', quantity: null },
  });
  expect(response.id).toBeDefined();
  expect(response.name).toEqual('Turtle');
});

test('should batch gets', async () => {
  const t0 = Date.now();
  await Promise.all([querkle.executeSql({ queryString: `SELECT * FROM animal WHERE id = '${insertedAnimalsIds[0]}'` }),
    querkle.executeSql({ queryString: `SELECT * FROM animal WHERE id = '${insertedAnimalsIds[1]}'` }),
    querkle.executeSql({ queryString: `SELECT * FROM animal WHERE id = '${insertedAnimalsIds[2]}'` })]);
  const t1 = Date.now();
  const diffTime1 = Math.abs((t1 - t0) / 1000);
  const t2 = Date.now();
  await Promise.all([
    querkle.get<AnimalRecord>({ entity: 'animal', where: 'id', is: insertedAnimalsIds[0] }),
    querkle.get<AnimalRecord>({ entity: 'animal', where: 'id', is: insertedAnimalsIds[1] }),
    querkle.get<AnimalRecord>({ entity: 'animal', where: 'id', is: insertedAnimalsIds[2] }),
  ]);
  const t3 = Date.now();
  const diffTime2 = Math.abs(t3 - t2) / 1000;
  expect(diffTime1).toBeGreaterThan(diffTime2);
});

test('should throw: insert a non-defined entity', async () => {
  try {
    await querkle.insert({ entity: 'critter', input: { zooId, name: 'Squirrel' } });
  } catch (e) {
    expect(e.message).toMatch('critter insertion failed: relation \"critter\" does not exist');
  }
});

test('should throw: inputs are not equal', async () => {
  try {
    await querkle.insertMany<AnimalRecord>({
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
    await querkle.insertMany<AnimalRecord>({
      inputArray: [
        { name: 'Squirrel' },
        { name: 'Elephant', quantity: 1 },
      ],
    });
  } catch (e) {
    expect(e.message).toMatch('entity was not provided for insertMany operation.');
  }
  try {
    await querkle.insertMany<AnimalRecord>({
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
  const newZoo = await querkle.insert({ entity: 'zoo', input: { city: 'Batchville' } });
  await querkle.insertMany<AnimalRecord>({
    entity: 'animal',
    inputArray: [
      // Ignored so TS will let us do bad things.
      // @ts-ignore
      { name: 'Pidgeon', quantity: null, zooId: newZoo.id },
      // @ts-ignore
      { name: 'Hippo', quantity: 1, zooId: newZoo.id },
    ],
  });

  const allAnimals = await querkle.getAll<AnimalRecord>({ entity: 'animal' });
  const allAnimalsWithZoos = allAnimals.filter(animal => !!animal.zooId);
  const zooIds = [...new Set(allAnimalsWithZoos.map(animal => animal.zooId))];
  const animalsByZooId = zooIds
    .map((zId) => ({
      [zId]: allAnimalsWithZoos
        .filter(animal => animal.zooId === zId),
    })).reduce((acc, curr) => ({ ...acc, ...curr }));

  const queryString = `
    SELECT animal.id,
           animal.name,
           zoo.id AS zoo_id,
           zoo.city
    FROM animal
           JOIN zoo ON animal.zoo_id = zoo.id
    WHERE zoo.id IN [BATCH]`;
  const results = await Promise.all([
    querkle.batchSql<ZooRecord>({
      queryString,
      addToBatch: insertedAnimalsIds[0],
      batchEntity: 'zoo',
      batchParam: 'id',
      multiple: true,
    }),
    querkle.batchSql<ZooRecord>({
      queryString,
      addToBatch: insertedAnimalsIds[1],
      batchEntity: 'zoo',
      batchParam: 'id',
      multiple: true,
    }),
    querkle.batchSql<ZooRecord>({
      queryString,
      addToBatch: insertedAnimalsIds[2],
      batchEntity: 'zoo',
      batchParam: 'id',
      multiple: true,
    })]);

  matchResults(results[0], animalsByZooId['0']);
  matchResults(results[1], animalsByZooId['1']);
  matchResults(results[2], animalsByZooId['2']);
});

test('should succeed: get with transform multiple', async () => {
  const response = await querkle.get<AnimalRecord>({
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
    SELECT animal.id,
           animal.name,
           zoo.id AS zoo_id,
           zoo.city
    FROM animal
           JOIN zoo
                ON animal.zoo_id = zoo.id
    WHERE zoo.city IN [BATCH]`;
  const results = await Promise.all([
    querkle.batchSql<ZooRecord>({
      queryString,
      addToBatch: 'Batchville',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
    }),
    querkle.batchSql<ZooRecord>({
      queryString,
      addToBatch: 'Boston',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
    }),
    querkle.batchSql<ZooRecord>({
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
    SELECT animal.id,
           animal.name,
           zoo.id AS zoo_id,
           zoo.city
    FROM animal
           JOIN zoo
                ON animal.zoo_id = zoo.id
    WHERE zoo.city IN [BATCH]`;

  const results = await Promise.all([
    querkle.batchSql<ZooRecord>({
      queryString,
      addToBatch: 'Batchville',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
      parameterize: false,
    }),
    querkle.batchSql<ZooRecord>({
      queryString,
      addToBatch: 'Boston',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
      parameterize: false,
    }),
    querkle.batchSql<ZooRecord>({
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

  const results = await Promise.all([
    querkle.batchSql<ZooRecord>({
      queryString: queryString1,
      addToBatch: 'Batchville',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
    }),
    querkle.batchSql<ZooRecord>({
      queryString: queryString1,
      addToBatch: 'Boston',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
    }),
    querkle.batchSql<ZooRecord>({
      queryString: queryString2,
      addToBatch: 0,
      batchEntity: 'zoo',
      batchParam: 'id',
      multiple: true,
    }),
    querkle.batchSql<ZooRecord>({
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
    querkle.batchSql<ZooRecord>({
      queryString: queryString1,
      addToBatch: 'Batchville',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
      transform: (result) => ({ ...result, city: 'OVERRIDDEN CITY' }),
    }),
    querkle.batchSql<ZooRecord>({
      queryString: queryString1,
      addToBatch: 'Boston',
      batchEntity: 'zoo',
      batchParam: 'city',
      multiple: true,
      transformMultiple: (rs) => rs.reduce((acc, curr) => `${acc}${curr.name}`, ''),
    }),
    querkle.batchSql<ZooRecord>({
      queryString: queryString2,
      addToBatch: 0,
      batchEntity: 'zoo',
      batchParam: 'id',
      multiple: true,
    }),
    querkle.batchSql<ZooRecord>({
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
    WHERE test.zoo.city IN ($1, $2, $3)`;

  const params = ['Batchville', 'Boston', 'Random'];
  const results = await querkle.executeSql({
    params, queryString, multiple: true,
  });
  expect(results.length).toBeGreaterThan(0);
});

test('should succeed: insert many animals and return them', async () => {
  const response = await querkle.insertMany<AnimalRecord>({
    entity: 'animal',
    inputArray: animals.map(animal => ({ ...animal, zooId })),
  });
  const firstAnimal = response[0];
  expect(firstAnimal.id).toBeDefined();
});
