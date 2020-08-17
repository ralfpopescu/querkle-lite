// const createDatabase = require('./create-database');
// const config = require('./config');

// eslint-disable-next-line func-names
(async function () {
  try {
    console.log('Use this for setup.');

    return process.exit(0);
  } catch (err) {
    throw new Error('Error during db setup', err);
  }
}());
