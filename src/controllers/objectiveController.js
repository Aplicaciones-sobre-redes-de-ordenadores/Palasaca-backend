<<<<<<< HEAD
const objetivosService = require("../services/objectivesService"); 
const Parse = require('parse/node');

// GET /objetivos/cuenta/:accountId
const getObjetivosByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: "Account ID is required"
      });
    }

    const objetivos = await objetivosService.getObjetivosByAccount(accountId);

    res.json({
      success: true,
      objetivos: objetivos.map(obj => obj.toJSON())
    });
  } catch (error) {
    console.error("Error in getObjetivosByAccount:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// POST /objetivos
const createObjetivo = async (req, res) => {
  try {
    const {
      id_cuenta,
      Descripcion,
      PorcentajeAhorro,
      Cantidad_Objetivo,
      Cantidad_Actual,
      Fecha_Inicio,
      Fecha_Fin,
      imagenObjetivo
    } = req.body;

    // Validaciones principales
    if (!id_cuenta || PorcentajeAhorro === undefined || !Cantidad_Objetivo || !Fecha_Inicio) {
      return res.status(400).json({
        success: false,
        error: "id_cuenta, PorcentajeAhorro, Cantidad_Objetivo y Fecha_Inicio son obligatorios"
      });
    }

    // Conversión y valores por defecto
    const objetivoData = {
      Descripcion: Descripcion || "",
      PorcentajeAhorro: parseFloat(PorcentajeAhorro),
      Cantidad_Objetivo: parseFloat(Cantidad_Objetivo),
      Cantidad_Actual: Cantidad_Actual ? parseFloat(Cantidad_Actual) : 0,
      Fecha_Inicio,
      Fecha_Fin: Fecha_Fin || null,
      imagenObjetivo: imagenObjetivo || null
    };

    // Crear objetivo en Parse
    const newObjetivo = await objetivosService.createObjetivo(id_cuenta, objetivoData);

    res.status(201).json({
      success: true,
      message: "Objetivo creado exitosamente",
      objetivo: newObjetivo.toJSON()
    });
  } catch (error) {
    console.error("Error in createObjetivo:", error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// PUT /objetivos/:id
const updateObjetivoProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { Cantidad_Actual } = req.body;

    if (!id || Cantidad_Actual === undefined) {
      return res.status(400).json({
        success: false,
        error: "Objective ID and Cantidad_Actual are required"
      });
    }

    const updatedObjetivo = await objetivosService.updateObjetivoProgress(id, Cantidad_Actual);

    res.status(200).json({
      success: true,
      message: "Progreso de objetivo actualizado correctamente",
      objetivo: updatedObjetivo.toJSON()
    });
  } catch (error) {
    console.error("Error in updateObjetivoProgress:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


const deleteObjetivo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: "Objective ID is required" });
    }

    const Objetivo = Parse.Object.extend("Objetivos");
    const query = new Parse.Query(Objetivo);

    // Obtener el objetivo
    const objetivo = await query.get(id, { useMasterKey: true });
    if (!objetivo) {
      return res.status(404).json({ success: false, error: "Objective not found" });
    }

    // Eliminarlo
    await objetivo.destroy({ useMasterKey: true });

    res.json({ success: true, message: "Objetivo eliminado" });
  } catch (error) {
    console.error("Error deleting objective:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getObjetivosByAccount,
  createObjetivo,
  updateObjetivoProgress,
  deleteObjetivo
};
=======
const objetivosService = require("../services/objectivesService"); 

// GET /objetivos/cuenta/:accountId
const getObjetivosByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: "Account ID is required"
      });
    }

    const objetivos = await objetivosService.getObjetivosByAccount(accountId);

    res.json({
      success: true,
      objetivos: objetivos.map(obj => obj.toJSON())
    });
  } catch (error) {
    console.error("Error in getObjetivosByAccount:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// POST /objetivos
const createObjetivo = async (req, res) => {
  try {
    const {
      id_cuenta,
      Descripcion,
      PorcentajeAhorro,
      Cantidad_Objetivo,
      Cantidad_Actual,
      Fecha_Inicio,
      Fecha_Fin,
      imagenObjetivo
    } = req.body;

    // Validaciones principales
    if (!id_cuenta || PorcentajeAhorro === undefined || !Cantidad_Objetivo || !Fecha_Inicio) {
      return res.status(400).json({
        success: false,
        error: "id_cuenta, PorcentajeAhorro, Cantidad_Objetivo y Fecha_Inicio son obligatorios"
      });
    }

    // Conversión y valores por defecto
    const objetivoData = {
      Descripcion: Descripcion || "",
      PorcentajeAhorro: parseFloat(PorcentajeAhorro),
      Cantidad_Objetivo: parseFloat(Cantidad_Objetivo),
      Cantidad_Actual: Cantidad_Actual ? parseFloat(Cantidad_Actual) : 0,
      Fecha_Inicio,
      Fecha_Fin: Fecha_Fin || null,
      imagenObjetivo: imagenObjetivo || null
    };

    // Crear objetivo en Parse
    const newObjetivo = await objetivosService.createObjetivo(id_cuenta, objetivoData);

    res.status(201).json({
      success: true,
      message: "Objetivo creado exitosamente",
      objetivo: newObjetivo.toJSON()
    });
  } catch (error) {
    console.error("Error in createObjetivo:", error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// PUT /objetivos/:id
const updateObjetivoProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { Cantidad_Actual } = req.body;

    if (!id || Cantidad_Actual === undefined) {
      return res.status(400).json({
        success: false,
        error: "Objective ID and Cantidad_Actual are required"
      });
    }

    const updatedObjetivo = await objetivosService.updateObjetivoProgress(id, Cantidad_Actual);

    res.status(200).json({
      success: true,
      message: "Progreso de objetivo actualizado correctamente",
      objetivo: updatedObjetivo.toJSON()
    });
  } catch (error) {
    console.error("Error in updateObjetivoProgress:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getObjetivosByAccount,
  createObjetivo,
  updateObjetivoProgress
};
>>>>>>> fd921378e7f46641de417459d14ce844c3267209
