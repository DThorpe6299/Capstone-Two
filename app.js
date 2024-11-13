"use strict";

/** Express app for jobly. */

const express = require("express");
console.log('required express')
const cors = require("cors");
console.log('required cors')

const { NotFoundError } = require("./expressError");

//const { authenticateJWT } = require("./middleware/auth");
console.log('required authenticateJWT')
//const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quizzes")
const mediaRoutes = require("./routes/media")
console.log({ quizRoutes })
const morgan = require("morgan");
console.log('required morgan and other routes')
const app = express();

app.use(cors());
app.use(express.json())

// try{
//   
//   app.use(express.json());
//   app.use(morgan("tiny"));
//   app.use(authenticateJWT);
//   }catch(e){
//     console.log(e)
//   }

app.use("/quiz", quizRoutes)
app.use("/media", mediaRoutes)

module.exports = app;