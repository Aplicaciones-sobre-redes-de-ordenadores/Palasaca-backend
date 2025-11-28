const Parse = require('parse/node');
const userService = require("../services/userService");

// GET /users
const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users.map(u => u.toJSON()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /users
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;  
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Todos los campos son obligatorios' 
      });
    }

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
    
    res.status(500).json({ 
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
      res.status(200).json(user.toJSON());
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
        let updatedUser = null;

        if (checkPassword && newPassword) {
          // primero validar + cambiar contraseña
          updatedUser = await userService.updateUserPassword(id, checkPassword, newPassword);
        }

        if (name) {
          // luego actualizar nombre (puedes usar el mismo usuario o volver a cargar)
          updatedUser = await userService.updateUserName(id, name);
        }

        if (!updatedUser) {
          return res.status(400).json({
            success: false,
            message: 'A name update or both checkPassword and newPassword are required.',
          });
        }

        return res.status(200).json(updatedUser.toJSON());
        
    } catch (error) {
        // 🔑 Manejar error de "Usuario no encontrado" (404)
        if (error.message && error.message.includes("Object not found")) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found with the given ID" 
            });
        }

        else if (error.message && error.message.includes("Unauthorized")) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid password" 
            });
        }
        
        // El resto de errores deben ser 500 (o 400 si son de negocio, ej. contraseña incorrecta)
        console.error('Error at updateUser:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Internal error during update'
        });
    }
};

// DELETE /users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);

    return res.json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    // Usuario no encontrado (Parse lanza "Object not found" cuando el id no existe)
    if (error.message && error.message.includes("Object not found")) {
      return res.status(404).json({
        success: false,
        message: "User not found with the given ID",
      });
    }

    console.error("Error at deleteUser:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error deleting user",
    });
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
    res.status(500).json({ message: error.message });
  }
};


module.exports = {getUserID, getUsers, createUser, getUserByEmail, updateUser, deleteUser};
