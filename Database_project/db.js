const pgp = require("pg-promise")();

const db = pgp({
    host: "localhost",
    port: 5432,
    database: "room_occupancy",
    user: "postgres",
    password: "30554106"  
});

module.exports = db;
