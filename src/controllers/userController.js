const Parse = require('parse/node');
const userService = require("../services/userService");

// GET /users
const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users.map(u => u.toJSON()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /users
const createUser = async (req, res) => {
  try {
<<<<<<< HEAD
    const { name, email, password } = req.body;   

    const newUser = await userService.addUser({ name, email, password});
    
    // Respuesta de éxito
    res.status(201).json({ 
      success: true,
      message: 'User created successfully',
      user: newUser.toJSON ? newUser.toJSON() : newUser
    });
=======
    const { name, email, password } = req.body;    
    const newUser = await userService.addUser({ name, email, password});
    res.status(201).json(newUser.toJSON());
>>>>>>> 4b57b26c63039bf09d039d2f984e541da0b0fcf9
  } catch (error) {
    console.error('Error at createUser:', error);
    
    // Manejar error de usuario duplicado de Parse/Back4App
    if (error.message && error.message.includes('User already exists')) {
      return res.status(400).json({ 
        success: false,
        error: 'User already exists with the given email' 
      });
    }
    
    res.status(400).json({ 
      success: false,
      error: error.message || 'Error creating user' 
    });
  }
};

// GET /users/email/:email
const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await userService.findUserByEmail(email);
    if (user) {
      res.json(user.toJSON());
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }
    const updatedUser = await userService.updateUser(id, name);
    res.json(updatedUser.toJSON());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// DELETE /users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserID = async (req, res) => {
  try {
    const { email, password } = req.body;
    const objectId = await userService.getUserObjectId(email, password);
    if (!objectId) {
      return res.status(404).json({ message: "Invalid email or password" });
    }
    res.json({ objectId });
  } catch (error) { 
    res.status(400).json({ message: error.message });
  }
};

const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const objectId = await userService.getUserObjectId(email, password);
    if (!objectId) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    return res.json({ 
        success: true
        , user: { objectId, email }
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {getUserID, getUsers, createUser, getUserByEmail, updateUser, deleteUser, loginUserController};
