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
    const { name, email, password } = req.body;   

    const newUser = await userService.addUser({ name, email, password});
    
    // Respuesta de éxito
    res.status(201).json({ 
      success: true,
      message: 'User created successfully',
      user: newUser.toJSON ? newUser.toJSON() : newUser
    });
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
    const { name, checkPassword, newPassword } = req.body;
    let updatedUser;

    if (name) {
      updatedUser = await userService.updateUserName(id, name);
    }

    if (checkPassword && newPassword) {
      updatedUser = await userService.updateUserPassword(id, checkPassword, newPassword);
    } else if (checkPassword || newPassword) {
      // Si solo se proporciona uno de los dos, devolver error
      return res.status(400).json({ message: "Both checkPassword and newPassword are required to change the password" });
    }

    // Si no se actualizó nada, devolver un mensaje
    if (!updatedUser) {
      return res.status(400).json({ message: "No fields to update" });
    }

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


// PUT /users/email/:id
const updateUserEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { newEmail } = req.body;
    const updatedUser = await userService.updateUserEmail(id, newEmail);
    res.json(updatedUser.toJSON());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /users/password/:id
const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkPassword, newPassword } = req.body;
    if (!checkPassword || !newPassword) {
      return res.status(400).json({ message: "checkPassword and newPassword are required" });
    }

    const updatedUser = await userService.updateUserPassword(id, checkPassword, newPassword);
    res.json(updatedUser.toJSON());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /users/:id
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.toJSON());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


module.exports = {getUserID, getUsers, createUser, getUserByEmail, updateUser, deleteUser, updateUserEmail, updateUserPassword, getUserById };
