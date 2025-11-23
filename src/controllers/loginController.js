const Parse = require('parse/node');
const userService = require("../services/userService");

const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userResult = await userService.getUserObjectId(email, password);
    
    if (!userResult) { 
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { id: objectId, esAdmin } = userResult; 

    console.log("objectId:", objectId);
    console.log("esAdmin:", esAdmin);
    
    return res.json({ 
      success: true
      , user: { objectId, email, esAdmin }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
    
};

module.exports = {loginUserController};
