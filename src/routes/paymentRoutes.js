const express = require('express');
const router = express.Router();
//const paymentController = require('../controllers/paymentController');
const {
    getPaymentsByAccount,
  createPayment,
  updatePaymentStatus,
  deletePayment,
    updatePaymentReminder
} = require('../controllers/paymentController');
// Obtener todos los pagos fijos de una cuenta
router.get('/account/:accountId', getPaymentsByAccount);

// Crear un nuevo pago fijo
router.post('/', createPayment);

// Actualizar el estado de un pago (ej. marcar como 'Pagado')
router.put('/:paymentId/status', updatePaymentStatus);

// Actualizar el recordatorio de un pago
router.put('/:paymentId/reminder', updatePaymentReminder);

// Eliminar un pago
router.delete('/:paymentId', deletePayment);

// Función de mantenimiento para marcar pagos como 'Vencido'
//router.get('/check-overdue', paymentController.checkOverduePayments);

module.exports = router;