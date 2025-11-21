const express = require('express');
const router = express.Router();
const {loginUserController} = require('../controllers/loginController');

router.post('/', loginUserController);
const RateLimit = require('express-rate-limit');

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});

router.use(limiter);

module.exports = router;

