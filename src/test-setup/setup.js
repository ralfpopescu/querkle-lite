const sql = require('mssql');

const createDatabase = require('./create-database');
const config = require('./config');

// eslint-disable-next-line func-names
(async function () {
  try {
    await createDatabase(config.database);

    const pool = await new sql.ConnectionPool(config);
    await pool.connect();

    console.log('Creating schema named test...');
    await pool.request().query('CREATE SCHEMA test');
    console.log('Created schema test.');

    pool.close();

    return process.exit(0);
  } catch (err) {
    throw new Error('Error during db setup', err);
  }
}());
