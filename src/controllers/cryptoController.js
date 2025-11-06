const cryptoService = require("../services/cryptoService");

const getAllCryptos = async (req, res) => {
  try {
    const cryptos = await cryptoService.getAllCryptos();
    res.json({ success: true, cryptos: cryptos.map(c => c.toJSON()) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createCrypto = async (req, res) => {
  try {
    const newCrypto = await cryptoService.createCrypto(req.body);
    res.status(201).json({ success: true, crypto: newCrypto.toJSON() });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getCrypto = async (req, res) => {
  try {
    const crypto = await cryptoService.getCryptoById(req.params.cryptoId);
    res.json({ success: true, crypto: crypto.toJSON() });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

const updateCrypto = async (req, res) => {
  try {
    const updated = await cryptoService.updateCrypto(req.params.cryptoId, req.body);
    res.json({ success: true, crypto: updated.toJSON() });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteCrypto = async (req, res) => {
  try {
    await cryptoService.deleteCrypto(req.params.cryptoId);
    res.json({ success: true, message: "Crypto deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllCryptos,
  createCrypto,
  getCrypto,
  updateCrypto,
  deleteCrypto
};
