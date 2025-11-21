const express = require('express');
const router = express.Router();
const movementController = require('../controllers/movementController');

router.get('/account/:accountId', movementController.getMovementsByAccount);
router.post('/', movementController.createMovement);
const RateLimit = require('express-rate-limit');

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});

router.use(limiter);

module.exports = router;