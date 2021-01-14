const QueryBuilder = require('node-querybuilder');
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

const pool = new QueryBuilder(settings, 'mysql', 'pool');
module.exports = pool;


var connection = mysql.createConnection(settings);

