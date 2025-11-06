const Parse = require("../config/parseConfig");
const BolsaModel = require("../models/BolsaModel");

// Obtener todas las empresas de bolsa
const getAllBolsas = async () => {
  try {
    const Bolsa = Parse.Object.extend("Bolsa");
    const query = new Parse.Query(Bolsa);
    query.descending("createdAt");

    const results = await query.find({ useMasterKey: true });

    return results.map(b => new BolsaModel(
      b.id,
      b.get("codigo"),
      b.get("empresa"),
      b.get("nombre"),
      b.get("url_imagen"),
      b.get("precio"),
      b.get("variacionPrecio"),
      b.get("createdAt"),
      b.get("updatedAt")
    ));
  } catch (error) {
    console.error("Error getting bolsas:", error);
    throw error;
  }
};

// Crear nueva empresa en bolsa
const createBolsa = async (data) => {
  try {
    const Bolsa = Parse.Object.extend("Bolsa");
    const bolsa = new Bolsa();

    bolsa.set("codigo", data.codigo);
    bolsa.set("empresa", data.empresa);
    bolsa.set("nombre", data.nombre);
    bolsa.set("url_imagen", data.url_imagen);
    bolsa.set("precio", parseFloat(data.precio));
    bolsa.set("variacionPrecio", parseFloat(data.variacionPrecio || 0));

    const saved = await bolsa.save(null, { useMasterKey: true });

    return new BolsaModel(
      saved.id,
      saved.get("codigo"),
      saved.get("empresa"),
      saved.get("nombre"),
      saved.get("url_imagen"),
      saved.get("precio"),
      saved.get("variacionPrecio"),
      saved.get("createdAt"),
      saved.get("updatedAt")
    );
  } catch (error) {
    console.error("Error creating bolsa:", error);
    throw error;
  }
};

// Obtener una empresa por ID
const getBolsaById = async (id) => {
  try {
    const Bolsa = Parse.Object.extend("Bolsa");
    const query = new Parse.Query(Bolsa);
    const result = await query.get(id, { useMasterKey: true });

    return new BolsaModel(
      result.id,
      result.get("codigo"),
      result.get("empresa"),
      result.get("nombre"),
      result.get("url_imagen"),
      result.get("precio"),
      result.get("variacionPrecio"),
      result.get("createdAt"),
      result.get("updatedAt")
    );
  } catch (error) {
    console.error("Error getting bolsa by id:", error);
    throw error;
  }
};

// Actualizar una empresa
const updateBolsa = async (id, updates) => {
  try {
    const Bolsa = Parse.Object.extend("Bolsa");
    const query = new Parse.Query(Bolsa);
    const bolsa = await query.get(id, { useMasterKey: true });

    if (updates.codigo) bolsa.set("codigo", updates.codigo);
    if (updates.empresa) bolsa.set("empresa", updates.empresa);
    if (updates.nombre) bolsa.set("nombre", updates.nombre);
    if (updates.url_imagen) bolsa.set("url_imagen", updates.url_imagen);
    if (updates.precio) bolsa.set("precio", parseFloat(updates.precio));
    if (updates.variacionPrecio) bolsa.set("variacionPrecio", parseFloat(updates.variacionPrecio));

    const saved = await bolsa.save(null, { useMasterKey: true });

    return new BolsaModel(
      saved.id,
      saved.get("codigo"),
      saved.get("empresa"),
      saved.get("nombre"),
      saved.get("url_imagen"),
      saved.get("precio"),
      saved.get("variacionPrecio"),
      saved.get("createdAt"),
      saved.get("updatedAt")
    );
  } catch (error) {
    console.error("Error updating bolsa:", error);
    throw error;
  }
};

// Eliminar una empresa
const deleteBolsa = async (id) => {
  try {
    const Bolsa = Parse.Object.extend("Bolsa");
    const query = new Parse.Query(Bolsa);
    const bolsa = await query.get(id, { useMasterKey: true });
    await bolsa.destroy({ useMasterKey: true });
    return true;
  } catch (error) {
    console.error("Error deleting bolsa:", error);
    throw error;
  }
};

module.exports = {
  getAllBolsas,
  createBolsa,
  getBolsaById,
  updateBolsa,
  deleteBolsa
};
