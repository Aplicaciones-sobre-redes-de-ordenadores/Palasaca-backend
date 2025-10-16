const Parse = require("../config/parseConfig");
const ObjetivoModel = require("../models/ObjectiveModel.js");

// Obtener objetivos por cuenta
const getObjetivosByAccount = async (accountId) => {
  try {
    const Objetivo = Parse.Object.extend("Objetivos");
    const query = new Parse.Query(Objetivo);
    
    const accountPointer = new Parse.Object("Cuentas");
    accountPointer.id = accountId;
    
    query.equalTo("id_cuenta", accountPointer);
    query.include("id_cuenta");
    query.descending("createdAt");
    
    const results = await query.find({ useMasterKey: true });
    
    return results.map(obj => new ObjetivoModel(
      obj.id,
      obj.get("id_cuenta").id,
      obj.get("Descripcion"),
      obj.get("PorcentajeAhorro"),
      obj.get("Cantidad_Objetivo"),
      obj.get("Cantidad_Actual"),
      obj.get("Fecha_Inicio"),
      obj.get("Fecha_Fin"),
      obj.get("imagenObjetivo") ? obj.get("imagenObjetivo").url() : null,
      obj.get("createdAt"),
      obj.get("updatedAt")
    ));
  } catch (error) {
    console.error("Error getting objectives:", error);
    throw error;
  }
};

// Crear nuevo objetivo
const createObjetivo = async (accountId, objetivoData) => {
  try {
    const Objetivo = Parse.Object.extend("Objetivos");
    const objetivo = new Objetivo();

    const accountPointer = new Parse.Object("Cuentas");
    accountPointer.id = accountId;

    objetivo.set("id_cuenta", accountPointer);
    objetivo.set("Descripcion", objetivoData.Descripcion || "");
    objetivo.set("PorcentajeAhorro", parseFloat(objetivoData.PorcentajeAhorro));
    objetivo.set("Cantidad_Objetivo", parseFloat(objetivoData.Cantidad_Objetivo));
    objetivo.set("Cantidad_Actual", parseFloat(objetivoData.Cantidad_Actual) || 0);
    objetivo.set("Fecha_Inicio", new Date(objetivoData.Fecha_Inicio));
    if (objetivoData.Fecha_Fin) objetivo.set("Fecha_Fin", new Date(objetivoData.Fecha_Fin));

    // Imagen opcional
    if (objetivoData.imagenObjetivo) {
      const parseFile = new Parse.File(
        objetivoData.imagenObjetivo.name,
        { base64: objetivoData.imagenObjetivo.base64 }
      );
      objetivo.set("imagenObjetivo", parseFile);
    }

    const saved = await objetivo.save(null, { useMasterKey: true });

    return new ObjetivoModel(
      saved.id,
      saved.get("id_cuenta").id,
      saved.get("Descripcion"),
      saved.get("PorcentajeAhorro"),
      saved.get("Cantidad_Objetivo"),
      saved.get("Cantidad_Actual"),
      saved.get("Fecha_Inicio"),
      saved.get("Fecha_Fin"),
      saved.get("imagenObjetivo") ? saved.get("imagenObjetivo").url() : null,
      saved.get("createdAt"),
      saved.get("updatedAt")
    );
  } catch (error) {
    console.error("Error creating objective:", error);
    throw error;
  }
};

// Actualizar progreso (cantidad actual)
const updateObjetivoProgress = async (objetivoId, cantidadNueva) => {
  try {
    const Objetivo = Parse.Object.extend("Objetivos");
    const query = new Parse.Query(Objetivo);
    
    const objetivo = await query.get(objetivoId, { useMasterKey: true });
    if (!objetivo) throw new Error("Objective not found");

    objetivo.set("Cantidad_Actual", parseFloat(cantidadNueva));
    await objetivo.save(null, { useMasterKey: true });

    return objetivo;
  } catch (error) {
    console.error("Error updating objective progress:", error);
    throw error;
  }
};


module.exports = {
  getObjetivosByAccount,
  createObjetivo,
  updateObjetivoProgress
};
