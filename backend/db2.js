var mysql = require('mysql');

// Initialize pool
const settings = {
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.DBUSER,
    password: process.env.PASSWORD,
    database: process.env.DATABSE,
    port: process.env.DBPORT,
    debug: false
};

var pool = mysql.createPool(settings);
module.exports = pool;

