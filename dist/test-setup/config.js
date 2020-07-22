require('dotenv').config();
module.exports = {
    server: process.env.SERVICE_DATABASE_SERVER,
    database: process.env.SERVICE_DATABASE_NAME,
    user: process.env.SERVICE_DATABASE_USER,
    password: process.env.SERVICE_DATABASE_PASSWORD,
};
//# sourceMappingURL=config.js.map