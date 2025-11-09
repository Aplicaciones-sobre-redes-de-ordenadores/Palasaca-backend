const Parse = require("parse/node");

// Configuración de Parse
Parse.initialize(
  process.env.APP_ID,     // Usar variables de entorno
  process.env.CLIENT_KEY,
  process.env.MASTER_KEY
);
Parse.serverURL = "https://parseapi.back4app.com/";

console.log("MASTER_KEY:", process.env.MASTER_KEY);


module.exports = Parse;