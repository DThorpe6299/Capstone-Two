"use strict";
/** Database setup for movie catalog. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri()
  });
}

db.connect()
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB connection error', err.stack));

module.exports = db;