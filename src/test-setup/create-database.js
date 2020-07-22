const sql = require('mssql');
const config = require('./config');

module.exports = async name => {
  const dbConfig = config;
  delete dbConfig.database;

  const pool = await new sql.ConnectionPool(dbConfig);
  await pool.connect();

  console.log(`Creating database named ${name}...`);
  await pool.request().query(`CREATE DATABASE ${name}`);
  console.log(`Created database ${name}.`);

  await pool.close();
};
