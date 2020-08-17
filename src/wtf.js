const { Pool } = require('pg');

const createPool = async (options) => {
  const envOptions = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: 5432,
  };
  const coalescedOptions = { ...envOptions, ...options };

  console.log('coalescedOptions', coalescedOptions);

  try {
    const pool = new Pool(coalescedOptions);
    const client = await pool.connect();
    return client;
  } catch (e) {
    throw new Error(`Failed to create pool. ${e}`);
  }
};

const dbOptions = {
  host: '127.0.0.1',
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
};

const wtf = async () => {
  const pool = await createPool(dbOptions);
  console.log(pool);
};

wtf();
