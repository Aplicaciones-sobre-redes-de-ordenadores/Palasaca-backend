const Parse = require('parse/node');

const ENV = process.env.NODE_ENV || 'development';
const isProd = ENV === 'production';

let APP_ID;
let CLIENT_KEY;
let MASTER_KEY;
let PARSE_SERVER_URL;

if (isProd) {
  APP_ID = process.env.APP_ID;
  CLIENT_KEY = process.env.CLIENT_KEY;
  MASTER_KEY = process.env.MASTER_KEY;
  PARSE_SERVER_URL = process.env.PARSE_SERVER_URL;
} else {
  APP_ID = process.env.APP_ID_DEV;
  CLIENT_KEY = process.env.CLIENT_KEY_DEV || '';
  MASTER_KEY = process.env.MASTER_KEY_DEV;
  PARSE_SERVER_URL =
    process.env.PARSE_SERVER_URL || 'http://parse:1337/parse';
}

console.log('NODE_ENV =', ENV);
console.log('Parse server =', PARSE_SERVER_URL);
console.log('APP_ID =', APP_ID);
console.log('MASTER_KEY (env) =', MASTER_KEY ? MASTER_KEY.slice(0, 5) + '***' : 'undefined');

Parse.initialize(APP_ID, CLIENT_KEY);   // 👈 SOLO 2 parámetros
Parse.serverURL = PARSE_SERVER_URL;
if (MASTER_KEY) {
  Parse.masterKey = MASTER_KEY;        // 👈 AQUÍ se fija el masterKey de verdad
  console.log(
    'Parse.masterKey =',
    Parse.masterKey ? Parse.masterKey.slice(0, 5) + '***' : 'undefined'
  );
}

module.exports = Parse;
