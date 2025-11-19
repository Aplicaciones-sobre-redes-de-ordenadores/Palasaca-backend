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
} = require('../controllers/userController');


router.get('/', getUsers);
router.post('/', createUser);
router.get('/email/:email', getUserByEmail); 
router.put('/:id', updateUser);           
router.delete('/:id', deleteUser); 
router.post("/getUserID",middlewares.authMiddleware("admin"),getUserID);


module.exports = router;
