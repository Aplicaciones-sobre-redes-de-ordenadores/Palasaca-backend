const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const app = express();


// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/users", userRoutes);

// Ruta base
app.get("/", (req, res) => {
  res.send("API funcionando");
});


module.exports = app;
