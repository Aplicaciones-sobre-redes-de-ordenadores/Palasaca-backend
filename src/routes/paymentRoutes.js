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
router.get('/account/:accountId', getPaymentsByAccount);
const RateLimit = require('express-rate-limit');

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});

router.use(limiter);

router.post('/', createPayment);

router.put('/:paymentId/status', updatePaymentStatus);

router.put('/:paymentId/reminder', updatePaymentReminder);

router.delete('/:paymentId', deletePayment);

// Función de mantenimiento para marcar pagos como 'Vencido'
//router.get('/check-overdue', paymentController.checkOverduePayments);

module.exports = router;