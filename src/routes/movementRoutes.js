const express = require('express');
const router = express.Router();
const movementController = require('../controllers/movementController');

router.get('/account/:accountId', movementController.getMovementsByAccount);
router.post('/', movementController.createMovement);

module.exports = router;