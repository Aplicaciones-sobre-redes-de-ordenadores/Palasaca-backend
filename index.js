const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const app = require("./src/app");

console.log("Puerto:", process.env.PORT); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
