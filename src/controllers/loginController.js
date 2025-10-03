const Parse = require('parse/node');
const userService = require("../services/userService");

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

module.exports = {loginUserController};
