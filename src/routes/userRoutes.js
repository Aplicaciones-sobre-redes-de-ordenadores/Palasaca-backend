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
  updateUserEmail,
  updateUserPassword,
  getUserById,
  updateAllUser
} = require('../controllers/userController');
const RateLimit = require('express-rate-limit');

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});

router.use(limiter);

router.get('/', getUsers);
router.post('/', createUser);
router.get('/email/:email', getUserByEmail); 
router.put('/:id', updateUser);           
router.put('/email/:id', updateUserEmail); 
router.put('/password/:id', updateUserPassword);
router.delete('/:id', deleteUser); 
router.post("/getUserID",middlewares.authMiddleware("admin"),getUserID);
router.get('/:id', getUserById);
router.put('/updates/:id', updateAllUser);
module.exports = router;
