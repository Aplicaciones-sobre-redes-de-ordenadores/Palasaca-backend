const express = require("express");
const router = express.Router();
const Parse = require("../config/parseConfig");

router.get("/", async (req, res) => {
  try {
    const Logs = Parse.Object.extend("Logs");
    const query = new Parse.Query(Logs);

    query.descending("createdAt");
    query.limit(100);

    const results = await query.find({ useMasterKey: true });

    const logs = results.map(l => ({
      action: l.get("action"),
      user: l.get("user"),
      timestamp: l.createdAt
    }));

    res.json({ logs });
  } catch (err) {
    console.error("Error obteniendo logs:", err);
    res.status(500).send({ error: "Error obteniendo logs" });
  }
});

module.exports = router;
