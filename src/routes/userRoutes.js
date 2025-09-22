const express = require('express');
const router = express.Router();
const { getUsers, createUser, getUserByEmail,updateUser, deleteUser} = require('../controllers/userController');

router.get('/', getUsers);
router.post('/', createUser);
router.get('/email/:email', getUserByEmail); 
router.put('/:id', updateUser);           
router.delete('/:id', deleteUser); 

module.exports = router;
