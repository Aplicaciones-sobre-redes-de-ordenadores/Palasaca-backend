const movementService = require("../services/movementService");

// GET /movements/account/:accountId
const getMovementsByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    if (!accountId) {
      return res.status(400).json({ 
        success: false,
        error: "Account ID is required" 
      });
    }

    const movements = await movementService.getMovementsByAccount(accountId);
    
    res.json({
      success: true,
      movements: movements.map(movement => movement.toJSON())
    });
  } catch (error) {
    console.error("Error in getMovementsByAccount:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// POST /movements
const createMovement = async (req, res) => {
  try {
    const { accountId, Tipo, Cantidad, Fijo, Categoria, Comentarios } = req.body;
    
    // Validaciones principales
    if (!accountId || !Tipo || Cantidad === undefined) {
      return res.status(400).json({ 
        success: false,
        error: "Account ID, Tipo and Cantidad are required" 
      });
    }

    // Validar que el Tipo sea válido
    if (!['gasto', 'ingreso'].includes(Tipo)) {
      return res.status(400).json({ 
        success: false,
        error: "Tipo must be 'gasto' or 'ingreso'" 
      });
    }

    // Ajustar el signo de la cantidad según el tipo
    let amountValue = parseFloat(Cantidad);
    if (Tipo === 'gasto' && amountValue > 0) {
      amountValue = -Math.abs(amountValue);
    } else if (Tipo === 'ingreso' && amountValue < 0) {
      amountValue = Math.abs(amountValue);
    }

    // Valores por defecto para campos opcionales
    const fijoValue = Fijo !== undefined ? Fijo : false;
    const categoriaValue = Categoria || 'Otros';
    const comentariosValue = Comentarios || '';

    // Crear movimiento
    const newMovement = await movementService.createMovement(accountId, {
      Tipo,
      Cantidad: amountValue,
      Fijo: fijoValue,
      Categoria: categoriaValue,
      Comentarios: comentariosValue
    });

    // Actualizar saldo de la cuenta
    await movementService.updateAccountBalance(accountId, amountValue);
    
    res.status(201).json({
      success: true,
      message: "Movement created successfully",
      movement: newMovement.toJSON()
    });
  } catch (error) {
    console.error("Error in createMovement:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// GET /movements/all
// Devuelve todos los movimientos de todos los usuarios, ideal para calcular tendencias generales
const getAllMovements = async (req, res) => {
  try {
    const movements = await movementService.getAllMovements(); // suponiendo que creas esta función en tu service

    res.json({
      success: true,
      movements: movements.map(movement => movement.toJSON())
    });
  } catch (error) {
    console.error("Error in getAllMovements:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getMovementsByAccount,
  createMovement,
  getAllMovements
};