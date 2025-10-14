const objetivosService = require("../services/objetivosService"); // Lógica de Parse

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
      objetivos: objetivos.map(obj => ({
        id: obj.id,
        id_cuenta: obj.id_cuenta,
        Descripcion: obj.Descripcion,
        PorcentajeAhorro: obj.PorcentajeAhorro,
        Cantidad_Objetivo: obj.Cantidad_Objetivo,
        Cantidad_Actual: obj.Cantidad_Actual,
        Fecha_Inicio: obj.Fecha_Inicio,
        Fecha_Fin: obj.Fecha_Fin,
        imagenObjetivo: obj.imagenObjetivo,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
      }))
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
      objetivo: {
        id: newObjetivo.id,
        id_cuenta: newObjetivo.id_cuenta,
        Descripcion: newObjetivo.Descripcion,
        PorcentajeAhorro: newObjetivo.PorcentajeAhorro,
        Cantidad_Objetivo: newObjetivo.Cantidad_Objetivo,
        Cantidad_Actual: newObjetivo.Cantidad_Actual,
        Fecha_Inicio: newObjetivo.Fecha_Inicio,
        Fecha_Fin: newObjetivo.Fecha_Fin,
        imagenObjetivo: newObjetivo.imagenObjetivo,
        createdAt: newObjetivo.createdAt,
        updatedAt: newObjetivo.updatedAt
      }
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
      objetivo: {
        id: updatedObjetivo.id,
        Cantidad_Actual: updatedObjetivo.get("Cantidad_Actual"),
        updatedAt: updatedObjetivo.get("updatedAt")
      }
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
