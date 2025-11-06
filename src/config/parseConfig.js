require('dotenv').config();
const Parse = require("parse/node");

Parse.initialize(
  process.env.APP_ID,
  process.env.CLIENT_KEY,
  process.env.MASTER_KEY
);
Parse.serverURL = "https://parseapi.back4app.com/";

console.log(" MASTER_KEY:", process.env.MASTER_KEY ? "Cargada correctamente" : "NO cargada");

module.exports = Parse;
