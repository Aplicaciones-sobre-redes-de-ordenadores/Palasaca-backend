const express = require('express');
const router = express.Router();

// importa el mismo nombre que exporta el controller
const { loginController } = require('../controllers/loginController');

router.post('/', loginController);

module.exports = router;
