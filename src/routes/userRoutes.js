const middlewares = require("../middlewares/authMiddleware"); 
const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  getUserID,
  getUserById
} = require('../controllers/userController');


router.get('/', getUsers);
router.post('/', createUser);
router.get('/email/:email', getUserByEmail); 
router.put('/:id', updateUser);           
router.delete('/:id', deleteUser); 
router.post("/getUserID",middlewares.authMiddleware("admin"),getUserID);
router.get('/:id', getUserById);

module.exports = router;
