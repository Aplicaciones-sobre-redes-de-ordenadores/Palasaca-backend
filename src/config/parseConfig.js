/*const Parse = require("parse/node");

// Configuración de Parse
Parse.initialize(
  process.env.APP_ID,     // Usar variables de entorno
  process.env.CLIENT_KEY,
  process.env.MASTER_KEY
);
Parse.serverURL = "https://parseapi.back4app.com/";

console.log("MASTER_KEY:", process.env.MASTER_KEY);


module.exports = Parse;*/
const Parse = require("parse/node");
const ENV = process.env.NODE_ENV || "development";

let PARSE_SERVER_URL;
let APP_ID;
let CLIENT_KEY;
let MASTER_KEY;

if (ENV === "production") {
  PARSE_SERVER_URL = process.env.PARSE_SERVER_URL || "https://parseapi.back4app.com/";
  APP_ID = process.env.APP_ID;
  CLIENT_KEY = process.env.CLIENT_KEY;
  MASTER_KEY = process.env.MASTER_KEY;
} else {
  PARSE_SERVER_URL = process.env.PARSE_SERVER_URL || "http://parse:1337/parse";
  APP_ID = process.env.APP_ID_DEV;
  CLIENT_KEY = process.env.CLIENT_KEY_DEV;
  MASTER_KEY = process.env.MASTER_KEY_DEV;
}

Parse.initialize(APP_ID, CLIENT_KEY, MASTER_KEY);
Parse.serverURL = PARSE_SERVER_URL;

console.log(`NODE_ENV = ${ENV}`);
console.log(`Parse server = ${PARSE_SERVER_URL}`);
module.exports = Parse;