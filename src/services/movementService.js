const Parse = require("../config/parseConfig");
const MovementModel = require("../models/MovementModel.js");
// Obtener movimientos por cuenta
const getMovementsByAccount = async (accountId) => {
  try {
    const Movement = Parse.Object.extend("Movimiento");
    const query = new Parse.Query(Movement);
    
    // Buscar por referencia a la cuenta
    const accountPointer = new Parse.Object("Cuentas");
    accountPointer.id = accountId;
    
    query.equalTo("id_cuenta", accountPointer);
    query.include("id_cuenta");
    query.descending("createdAt");
    
    const results = await query.find({ useMasterKey: true });
    
    return results.map(movement => new MovementModel(
      movement.id,
      movement.get("id_cuenta").id,
      movement.get("Tipo"),
      movement.get("Fijo") || false,
      movement.get("Categoria"),
      movement.get("Comentarios"),
      movement.get("Cantidad"),
      movement.get("createdAt"),
      movement.get("updatedAt")
    ));
  } catch (error) {
    console.error("Error getting movements:", error);
    throw error;
  }
};

// Crear nuevo movimiento
const createMovement = async (accountId, movementData) => {
  try {
    const Movement = Parse.Object.extend("Movimiento");
    const movement = new Movement();
    
    // Crear referencia a la cuenta
    const accountPointer = new Parse.Object("Cuentas");
    accountPointer.id = accountId;
    
    movement.set("id_cuenta", accountPointer);
    movement.set("Tipo", movementData.Tipo);
    movement.set("Cantidad", parseFloat(movementData.Cantidad));
    movement.set("Fijo", movementData.Fijo || false);
    movement.set("Categoria", movementData.Categoria || "");
    movement.set("Comentarios", movementData.Comentarios || "");
    
    const savedMovement = await movement.save(null, { useMasterKey: true });
    
    return new MovementModel(
      savedMovement.id,
      savedMovement.get("id_cuenta").id,
      savedMovement.get("Tipo"),
      savedMovement.get("Fijo"),
      savedMovement.get("Categoria"),
      savedMovement.get("Comentarios"),
      savedMovement.get("Cantidad"),
      savedMovement.get("createdAt"),
      savedMovement.get("updatedAt")
    );
  } catch (error) {
    console.error("Error creating movement:", error);
    throw error;
  }
};

// Actualizar saldo de la cuenta
const updateAccountBalance = async (accountId, amountChange) => {
  try {
    const Account = Parse.Object.extend("Cuentas");
    const query = new Parse.Query(Account);
    
    const account = await query.get(accountId, { useMasterKey: true });
    if (!account) throw new Error("Account not found");
    
    const currentBalance = account.get("Dinero") || 0;
    const newBalance = currentBalance + amountChange;
    
    account.set("Dinero", newBalance);
    await account.save(null, { useMasterKey: true });
    
    return newBalance;
  } catch (error) {
    console.error("Error updating account balance:", error);
    throw error;
  }
};
// Obtener todos los movimientos
const getAllMovements = async () => {
  try {
    const Movement = Parse.Object.extend("Movimiento");
    const query = new Parse.Query(Movement);

    // Traer todos los movimientos, sin filtro de cuenta
    const results = await query.find({ useMasterKey: true });

    return results.map(mov => new MovementModel(
      mov.id,
      mov.get("id_cuenta")?.id || null,
      mov.get("Tipo"),
      mov.get("Fijo"),
      mov.get("Categoria"),
      mov.get("Comentarios"),
      mov.get("Cantidad"),
      mov.get("createdAt"),
      mov.get("updatedAt")
    ));
  } catch (error) {
    console.error("Error fetching all movements:", error);
    throw error;
  }
};


// Obtener tendencia mensual Y desglose por categorías
const getMonthlyTrend = async (accountId) => {
  try {
    const Movement = Parse.Object.extend("Movimiento");
    const query = new Parse.Query(Movement);

    // 1. Filtrar por cuenta
    const accountPointer = new Parse.Object("Cuentas");
    accountPointer.id = accountId;
    query.equalTo("id_cuenta", accountPointer);

    // 2. Filtrar por fecha (últimos 6 meses)
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 2);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    query.greaterThanOrEqualTo("createdAt", sixMonthsAgo);
    query.ascending("createdAt");

    const results = await query.find({ useMasterKey: true });

    // --- PROCESAMIENTO TENDENCIA  ---
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const trendMap = new Map();

    for (let i = 0; i < 3; i++) {
      const d = new Date(sixMonthsAgo);
      d.setMonth(d.getMonth() + i);
      const key = `${monthNames[d.getMonth()]}`;
      trendMap.set(key, { income: 0, expense: 0 });
    }


    const categoryMap = { ingreso: {}, gasto: {} };

    results.forEach((mov) => {
      // 1. Lógica Tendencia Mensual
      const date = mov.get("createdAt");
      const monthIndex = date.getMonth();
      const monthKey = monthNames[monthIndex];
      const type = mov.get("Tipo"); // 'ingreso' o 'gasto'
      const amount = Math.abs(mov.get("Cantidad"));
      const catName = mov.get("Categoria") || "Otros";

      if (trendMap.has(monthKey)) {
        const currentData = trendMap.get(monthKey);
        if (type === 'ingreso') currentData.income += amount;
        else if (type === 'gasto') currentData.expense += amount;
        trendMap.set(monthKey, currentData);
      }

      // 2. Lógica Desglose Categorías
      if (type === 'ingreso' || type === 'gasto') {
        if (!categoryMap[type][catName]) categoryMap[type][catName] = 0;
        categoryMap[type][catName] += amount;
      }
    });

    // Formatear Tendencia
    const labels = [];
    const dataIngresos = [];
    const dataGastos = [];
    trendMap.forEach((value, key) => {
      labels.push(key);
      dataIngresos.push(value.income);
      dataGastos.push(value.expense);
    });

    // Formatear Categorías (Convertir objeto a array ordenado)
    const formatCats = (catObj) => Object.entries(catObj)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total); // Ordenar mayor a menor

    return {
      trend: { labels, dataIngresos, dataGastos },
      categories: {
        ingresos: formatCats(categoryMap.ingreso),
        gastos: formatCats(categoryMap.gasto)
      }
    };

  } catch (error) {
    console.error("Error calculating trend:", error);
    throw error;
  }
};


module.exports = {
  getMovementsByAccount,
  createMovement,
  updateAccountBalance,
  getAllMovements,
  getMonthlyTrend 
};