const createPool = require('../create-pool');

module.exports = async name => {
  const pool = await createPool();
  await pool.connect();

  console.log(`Creating database named ${name}...`);
  await pool.request().query(`CREATE DATABASE ${name}`);
  console.log(`Created database ${name}.`);

  await pool.close();
};
