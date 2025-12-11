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
    sixMonthsAgo.setMonth(today.getMonth() - 5); // 5 meses atrás + el actual = 6
    sixMonthsAgo.setDate(1); // Desde el día 1
    sixMonthsAgo.setHours(0, 0, 0, 0);

    query.greaterThanOrEqualTo("createdAt", sixMonthsAgo);
    query.ascending("createdAt"); // Ordenar por fecha para facilitar el agrupamiento

    const results = await query.find({ useMasterKey: true });

    // 3. Inicializar estructura de los últimos 6 meses (para que aparezcan meses vacíos si los hay)
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const trendMap = new Map();

    // Rellenamos el mapa con los últimos 6 meses inicializados a 0
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo);
      d.setMonth(d.getMonth() + i);
      const key = `${monthNames[d.getMonth()]}`; // Ejemplo: "Ene", "Feb"
      trendMap.set(key, { income: 0, expense: 0 });
    }

    // 4. Procesar y sumarizar los datos
    results.forEach((mov) => {
      const date = mov.get("createdAt");
      const monthIndex = date.getMonth();
      const key = monthNames[monthIndex];

      // Solo procesamos si el mes cae dentro de nuestro rango generado (seguridad)
      if (trendMap.has(key)) {
        const type = mov.get("Tipo"); // 'ingreso' o 'gasto'
        const amount = Math.abs(mov.get("Cantidad")); // Usamos valor absoluto para el gráfico

        const currentData = trendMap.get(key);
        
        if (type === 'ingreso') {
          currentData.income += amount;
        } else if (type === 'gasto') {
          currentData.expense += amount;
        }
        
        trendMap.set(key, currentData);
      }
    });

    // 5. Formatear para el Frontend
    const labels = [];
    const dataIngresos = [];
    const dataGastos = [];

    trendMap.forEach((value, key) => {
      labels.push(key);
      dataIngresos.push(value.income);
      dataGastos.push(value.expense);
    });

    return {
      labels,
      dataIngresos,
      dataGastos
    };

  } catch (error) {
    console.error("Error calculating monthly trend:", error);
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