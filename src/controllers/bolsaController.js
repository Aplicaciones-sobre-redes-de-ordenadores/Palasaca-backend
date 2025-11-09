const bolsaService = require("../services/bolsaService");

const getAllBolsas = async (req, res) => {
  try {
    const bolsas = await bolsaService.getAllBolsas();
    res.json({ success: true, bolsas: bolsas.map(b => b.toJSON()) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createBolsa = async (req, res) => {
  try {
    const newBolsa = await bolsaService.createBolsa(req.body);
    res.status(201).json({ success: true, bolsa: newBolsa.toJSON() });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getBolsa = async (req, res) => {
  try {
    const bolsa = await bolsaService.getBolsaById(req.params.bolsaId);
    res.json({ success: true, bolsa: bolsa.toJSON() });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

const updateBolsa = async (req, res) => {
  try {
    const updated = await bolsaService.updateBolsa(req.params.bolsaId, req.body);
    res.json({ success: true, bolsa: updated.toJSON() });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteBolsa = async (req, res) => {
  try {
    await bolsaService.deleteBolsa(req.params.bolsaId);
    res.json({ success: true, message: "Bolsa deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllBolsas,
  createBolsa,
  getBolsa,
  updateBolsa,
  deleteBolsa
};
