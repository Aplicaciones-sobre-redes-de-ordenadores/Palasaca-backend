const express = require('express');
const router = express.Router();
const middlewares = require("../middlewares/authMiddleware");

const {
  getObjetivosByAccount,
  createObjetivo,
  updateObjetivoProgress,
  deleteObjetivo
} = require('../controllers/objetivosController');

// Obtener todos los objetivos de una cuenta
router.get('/cuenta/:idCuenta', getObjetivosByAccount);

// Crear un nuevo objetivo
router.post('/', createObjetivo);

// Actualizar el progreso (Cantidad_Actual) de un objetivo
router.put('/:id', updateObjetivoProgress);

// Eliminar un objetivo (opcional, por si lo implementas)
router.delete('/:id', deleteObjetivo);

// Ejemplo de ruta protegida (solo admin o usuario autenticado)
router.get('/protegido/:idCuenta', middlewares.authMiddleware("admin"), getObjetivosByAccount);

module.exports = router;
