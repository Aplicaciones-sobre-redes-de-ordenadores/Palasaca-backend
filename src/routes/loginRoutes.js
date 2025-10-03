const express = require('express');
const router = express.Router();
const {loginUserController} = require('../controllers/loginController');

router.post('/login', loginUserController);

module.exports = router;

