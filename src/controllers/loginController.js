const Parse = require("../config/parseConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const isDev = process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'development';

const loginController = async (req, res) => {
  try {
    const rawEmail = (req.body?.email || "").trim();
    const password = req.body?.password || "";
    const email = rawEmail.toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email y password requeridos" });
    }

    const Usuarios = Parse.Object.extend("Usuarios");
    let foundBy = null;

    // Buscar por 'email' (normalizado)
    let q = new Parse.Query(Usuarios);
    q.equalTo("email", email);
    let user = await q.first({ useMasterKey: true });
    if (user) foundBy = 'email';

    // Fallback: buscar por 'Correo' (probamos normalizado y crudo)
    if (!user) {
      let q2 = new Parse.Query(Usuarios);
      q2.equalTo("Correo", rawEmail);
      user = await q2.first({ useMasterKey: true });
      if (user) foundBy = 'Correo(raw)';

      if (!user) {
        let q3 = new Parse.Query(Usuarios);
        q3.equalTo("Correo", email);
        user = await q3.first({ useMasterKey: true });
        if (user) foundBy = 'Correo(lower)';
      }
    }

    if (!user) {
      if (isDev) console.log("[LOGIN] NO USER", { email, rawEmail });
      return res.status(401).json({ success: false, error: "Usuario no encontrado" });
    }

    const stored = user.get("PassWord") || "";
    const sample = stored.slice(0, 7); // no logs de secretos completos
    if (isDev) console.log("[LOGIN] USER FOUND", {
      foundBy,
      userId: user.id,
      hasHashPrefix: stored.startsWith("$2b$") || stored.startsWith("$2a$"),
      storedSample: sample
    });

    let isValid = false;
    if (stored.startsWith("$2b$") || stored.startsWith("$2a$")) {
      try {
        isValid = await bcrypt.compare(password, stored);
      } catch (e) {
        if (isDev) console.log("[LOGIN] bcrypt error:", e?.message);
        isValid = false;
      }
    } else {
      // fallback dev por si el PassWord está en texto plano en tu seed
      isValid = password === stored;
    }

    if (!isValid) {
      if (isDev) console.log("[LOGIN] BAD PASSWORD", { userId: user.id });
      return res.status(401).json({ success: false, error: "Contraseña incorrecta" });
    }

    const userId = user.id;
    const name = user.get("name") || user.get("Nombre") || "";
    const emailUser = user.get("email") || user.get("Correo") || rawEmail;

    const token = process.env.JWT_SECRET
      ? jwt.sign({ userId, role: "user" }, process.env.JWT_SECRET, { expiresIn: "7d" })
      : null;

    return res.json({ success: true, user: { objectId: userId, email: emailUser, name }, token });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ success: false, error: "Error en el servidor" });
  }
};

module.exports = { loginController };