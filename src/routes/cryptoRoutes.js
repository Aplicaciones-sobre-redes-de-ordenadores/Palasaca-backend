const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

router.get('/', cryptoController.getAllCryptos);
router.post('/', cryptoController.createCrypto);
router.get('/:cryptoId', cryptoController.getCrypto);
router.put('/:cryptoId', cryptoController.updateCrypto);
router.delete('/:cryptoId', cryptoController.deleteCrypto);

module.exports = router;
