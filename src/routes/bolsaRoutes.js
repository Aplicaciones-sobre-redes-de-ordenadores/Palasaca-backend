const express = require('express');
const router = express.Router();
const bolsaController = require('../controllers/bolsaController');

router.get('/', bolsaController.getAllBolsas);
router.post('/', bolsaController.createBolsa);
router.get('/:bolsaId', bolsaController.getBolsa);
router.put('/:bolsaId', bolsaController.updateBolsa);
router.delete('/:bolsaId', bolsaController.deleteBolsa);
const RateLimit = require('express-rate-limit');

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});

router.use(limiter);

module.exports = router;
