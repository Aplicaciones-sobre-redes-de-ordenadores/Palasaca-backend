const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/user/:userId', accountController.getAccountsByUser);
router.get('/count', accountController.getTotalAccountsCount);
router.post('/', accountController.createAccount);
router.get('/:accountId', accountController.getAccountById);
router.put('/:accountId', accountController.updateAccount);
router.delete('/:accountId', accountController.deleteAccount);
router.get('/', accountController.getTotalAccountsCount);
const RateLimit = require('express-rate-limit');


const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});

router.use(limiter);

module.exports = router;