const express = require("express");
const cors = require("cors");
const Parse = require("./config/parseConfig");
const userRoutes = require("./routes/userRoutes");
const accountRoutes = require('./routes/accountRoutes');
const objectiveRoutes = require('./routes/objectiveRoutes');
const movementRoutes = require('./routes/movementRoutes');
const loginRoutes = require('./routes/loginRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const cryptoRoutes = require('./routes/cryptoRoutes');
const bolsaRoutes = require('./routes/bolsaRoutes');
const logRoutes = require('./routes/logRoutes');
const { saveLog } = require('./services/logService');
const app = express();


// --- Middleware esenciales ---
app.use(cors());
app.use(express.json());

// Ruta base
app.get("/", (req, res) => {
  res.send("Servidor Web funcionando");
});


// --- Logging de peticiones ---
app.use(async (req, res, next) => {
  console.log('>>> REQ:', req.method, req.originalUrl, 'body:', req.body);  
  try {
    if (req.method === 'GET') return next();
    if (req.originalUrl.startsWith('/logs') || req.originalUrl.startsWith('/login')) return next();
    await saveLog(
      `${req.method} ${req.originalUrl}`,
      req.body.userId || req.headers['User-Id'] || 'unknown'
    );
  } catch (e) {
    console.log("No se pudo guardar log", e);
  }
  next();
});

// Rutas
app.use("/users", userRoutes);
app.use('/accounts', accountRoutes);
app.use('/movements', movementRoutes);
app.use('/login', loginRoutes);
app.use('/payments', paymentRoutes);
app.use('/cryptos', cryptoRoutes);
app.use('/bolsas', bolsaRoutes);
app.use('/objectives', objectiveRoutes);
app.use('/logs', logRoutes);

// --- Ruta no encontrada (404) ---
app.use((req, res, next) => {
  res.status(404).send({ 
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` 
  });
});

module.exports = app ;