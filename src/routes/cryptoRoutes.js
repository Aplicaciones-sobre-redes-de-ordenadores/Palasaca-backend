const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

router.get('/', cryptoController.getAllCryptos);
router.post('/', cryptoController.createCrypto);
router.get('/:cryptoId', cryptoController.getCrypto);
router.put('/:cryptoId', cryptoController.updateCrypto);
router.delete('/:cryptoId', cryptoController.deleteCrypto);
const RateLimit = require('express-rate-limit');

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});

router.use(limiter);

module.exports = router;
