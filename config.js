"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");
const { password } = require("./passkey.js");
const { Pool } = require('pg');

const SECRET_KEY = process.env.SECRET_KEY || "dev-secret";

const PORT = process.env.PORT || 3001;

console.log({PORT})

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
      ? "movie_picker_test"
      : process.env.DATABASE_URL || `postgresql://dthorpe:${password}@localhost:5432/movie_picker`;
}

// Using the config to create a PostgreSQL connection pool.
const pool = new Pool({
  user: "dthorpe",
  host: "localhost",
  database: getDatabaseUri(),
  password: password,
  port: 5432,
});

const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;



console.log("Jobly Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("TMDB Bearer Token Loaded:".yellow, Boolean(TMDB_BEARER_TOKEN));
console.log("---");
console.log("Environment Variables at Startup:");
console.log(process.env);


module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR: process.env.NODE_ENV === "test" ? 1 : 12,
  getDatabaseUri,
  pool,
  TMDB_BEARER_TOKEN,
};
