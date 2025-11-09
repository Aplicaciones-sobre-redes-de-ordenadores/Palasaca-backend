const Parse = require("../config/parseConfig");
const CryptoModel = require("../models/CryptoModel");

// Obtener todas las criptomonedas
const getAllCryptos = async () => {
  try {
    const Crypto = Parse.Object.extend("Crypto");
    const query = new Parse.Query(Crypto);
    query.descending("createdAt");

    const results = await query.find({ useMasterKey: true });

    return results.map(c => new CryptoModel(
      c.id,
      c.get("Simbolo"),
      c.get("Precio"),
      c.get("VariacionPrecio"),
      c.get("createdAt"),
      c.get("updatedAt")
    ));
  } catch (error) {
    console.error("Error getting cryptos:", error);
    throw error;
  }
};

// Crear una nueva criptomoneda
const createCrypto = async (data) => {
  try {
    const Crypto = Parse.Object.extend("Crypto");
    const crypto = new Crypto();

    crypto.set("Simbolo", data.simbolo);
    crypto.set("Precio", parseFloat(data.precio));
    crypto.set("VariacionPrecio", parseFloat(data.VariacionPrecio || 0));

    const saved = await crypto.save(null, { useMasterKey: true });

    return new CryptoModel(
      saved.id,
      saved.get("Simbolo"),
      saved.get("Precio"),
      saved.get("VariacionPrecio"),
      saved.get("createdAt"),
      saved.get("updatedAt")
    );
  } catch (error) {
    console.error("Error creating crypto:", error);
    throw error;
  }
};

// Obtener una criptomoneda por ID
const getCryptoById = async (id) => {
  try {
    const Crypto = Parse.Object.extend("Crypto");
    const query = new Parse.Query(Crypto);
    const result = await query.get(id, { useMasterKey: true });

    return new CryptoModel(
      result.id,
      result.get("Simbolo"),
      result.get("Precio"),
      result.get("VariacionPrecio"),
      result.get("createdAt"),
      result.get("updatedAt")
    );
  } catch (error) {
    console.error("Error getting crypto by id:", error);
    throw error;
  }
};

// Actualizar una criptomoneda
const updateCrypto = async (id, updates) => {
  try {
    const Crypto = Parse.Object.extend("Crypto");
    const query = new Parse.Query(Crypto);
    const crypto = await query.get(id, { useMasterKey: true });

    if (updates.simbolo) crypto.set("simbolo", updates.simbolo);
    if (updates.precio) crypto.set("precio", parseFloat(updates.precio));
    if (updates.VariacionPrecio) crypto.set("VariacionPrecio", parseFloat(updates.VariacionPrecio));

    const saved = await crypto.save(null, { useMasterKey: true });

    return new CryptoModel(
      saved.id,
      saved.get("Simbolo"),
      saved.get("Precio"),
      saved.get("VariacionPrecio"),
      saved.get("createdAt"),
      saved.get("updatedAt")
    );
  } catch (error) {
    console.error("Error updating crypto:", error);
    throw error;
  }
};

// Eliminar una criptomoneda
const deleteCrypto = async (id) => {
  try {
    const Crypto = Parse.Object.extend("Crypto");
    const query = new Parse.Query(Crypto);
    const crypto = await query.get(id, { useMasterKey: true });
    await crypto.destroy({ useMasterKey: true });
    return true;
  } catch (error) {
    console.error("Error deleting crypto:", error);
    throw error;
  }
};

module.exports = {
  getAllCryptos,
  createCrypto,
  getCryptoById,
  updateCrypto,
  deleteCrypto
};
