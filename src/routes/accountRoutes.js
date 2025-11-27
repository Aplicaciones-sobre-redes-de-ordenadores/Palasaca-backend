const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/user/:userId', accountController.getAccountsByUser);
router.post('/', accountController.createAccount);
router.get('/:accountId', accountController.getAccountById);
router.put('/:accountId', accountController.updateAccount);
router.delete('/:accountId', accountController.deleteAccount);

module.exports = router;