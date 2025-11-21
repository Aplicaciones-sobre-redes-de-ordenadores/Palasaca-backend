const express = require('express');
const router = express.Router();
const middlewares = require("../middlewares/authMiddleware");
const rateLimit = require('express-rate-limit');

const {
  getObjetivosByAccount,
  createObjetivo,
  updateObjetivoProgress,
  deleteObjetivo
} = require('../controllers/objectiveController');

// Obtener todos los objetivos de una cuenta
router.get('/cuenta/:accountId', getObjetivosByAccount);

// Crear un nuevo objetivo
router.post('/', createObjetivo);

// Actualizar el progreso (Cantidad_Actual) de un objetivo
router.put('/:id', updateObjetivoProgress);

// Eliminar un objetivo (opcional, por si lo implementas)
router.delete('/:id', deleteObjetivo);

// Ejemplo de ruta protegida (solo admin o usuario autenticado)
const objetivoProtegidoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests, please try again later."
});
router.get('/protegido/:idCuenta', objetivoProtegidoLimiter, middlewares.authMiddleware("admin"), getObjetivosByAccount);
module.exports = router;
