//De momento no se utilizará, pero se tendrá en cuenta 
// para endponits sensibles
const jwt = require("jsonwebtoken");

const authMiddleware = (requiredRole) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ message: "No autorizado" });
      }

      req.userId = payload.userId;
      req.userRole = payload.role;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token inválido" });
    }
  };
};

module.exports = {authMiddleware};


//para firmar
//const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: "1h" });

