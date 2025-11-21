const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/user/:userId', accountController.getAccountsByUser);
router.post('/', accountController.createAccount);
router.get('/:accountId', accountController.getAccount);
router.put('/:accountId', accountController.updateAccount);
router.delete('/:accountId', accountController.deleteAccount);
const RateLimit = require('express-rate-limit');

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});

router.use(limiter);

module.exports = router;