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
      b.get("Codigo"),
      b.get("Empresa"),
      b.get("Nombre"),
      b.get("URLImagen"),
      b.get("Precio"),
      b.get("VariacionPrecioDiario"),
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

    bolsa.set("Codigo", data.codigo);
    bolsa.set("Empresa", data.empresa);
    bolsa.set("Nombre", data.nombre);
    bolsa.set("URLImagen", data.url_imagen);
    bolsa.set("Precio", parseFloat(data.precio));
    bolsa.set("VariacionPrecioDiario", parseFloat(data.VariacionPrecioDiario || 0));

    const saved = await bolsa.save(null, { useMasterKey: true });

    return new BolsaModel(
      saved.id,
      saved.get("Codigo"),
      saved.get("Empresa"),
      saved.get("Nombre"),
      saved.get("URLImagen"),
      saved.get("Precio"),
      saved.get("VariacionPrecioDiario"),
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
      result.get("Codigo"),
      result.get("Empresa"),
      result.get("Nombre"),
      result.get("URLImagen"),
      result.get("Precio"),
      result.get("VariacionPrecioDiario"),
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

    if (updates.codigo) bolsa.set("Codigo", updates.codigo);
    if (updates.empresa) bolsa.set("Empresa", updates.empresa);
    if (updates.nombre) bolsa.set("Nombre", updates.nombre);
    if (updates.url_imagen) bolsa.set("URLImagen", updates.url_imagen);
    if (updates.precio) bolsa.set("Precio", parseFloat(updates.precio));
    if (updates.VariacionPrecioDiario) bolsa.set("VariacionPrecioDiario", parseFloat(updates.VariacionPrecioDiario));

    const saved = await bolsa.save(null, { useMasterKey: true });

    return new BolsaModel(
      saved.id,
      saved.get("Codigo"),
      saved.get("Empresa"),
      saved.get("Nombre"),
      saved.get("URLImagen"),
      saved.get("Precio"),
      saved.get("VariacionPrecioDiario"),
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
