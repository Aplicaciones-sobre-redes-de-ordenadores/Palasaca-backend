// src/services/accountService.js
const Parse = require("../config/parseConfig");

// Helper: elegir nombre del usuario con fallbacks
function pickUserName(userObj) {
  return (
    userObj.get("name") ||
    userObj.get("Nombre") ||             // <- tu columna antigua
    userObj.get("email") ||
    userObj.get("Correo") ||             // <- por si en tu DB está como 'Correo'
    ""
  );
}

// Obtener todas las cuentas de un usuario (DEVUELVE OBJETO PLANO con usuario expandido)
const getAccountsByUser = async (userId) => {
  try {
    const Cuentas = Parse.Object.extend("Cuentas");
    const query = new Parse.Query(Cuentas);

    // Buscar por referencia al usuario
    const userPointer = new Parse.Object("Usuarios");
    userPointer.id = userId;

    query.equalTo("id_usuario", userPointer);
    query.include("id_usuario"); // trae el usuario completo
    query.ascending("createdAt");

    const results = await query.find({ useMasterKey: true });

    return results.map((obj) => {
      const user = obj.get("id_usuario");
      return {
        id: obj.id,
        NombreCuenta: obj.get("NombreCuenta"),
        Dinero: obj.get("Dinero") ?? 0,
        id_usuario: user
          ? {
              objectId: user.id,
              name: pickUserName(user),                         // 👈 nombre ya resuelto
              email: user.get("email") || user.get("Correo") || "",
            }
          : null,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt,
      };
    });
  } catch (error) {
    console.error("Error getting accounts:", error);
    throw error;
  }
};

// Crear nueva cuenta para un usuario (devuelve objeto plano)
const createAccount = async (userId, accountName, initialBalance = 0) => {
  try {
    const Cuentas = Parse.Object.extend("Cuentas");
    const account = new Cuentas();

    // Referencia al usuario
    const userPointer = new Parse.Object("Usuarios");
    userPointer.id = userId;

    account.set("id_usuario", userPointer);
    account.set("NombreCuenta", accountName);
    account.set("Dinero", Number(initialBalance) || 0);

    const saved = await account.save(null, { useMasterKey: true });

    // Nota: aquí el pointer no viene expandido; si lo necesitas expandido al crear,
    // podrías hacer un fetch con include. Para la mayoría de UIs no hace falta.
    return {
      id: saved.id,
      NombreCuenta: saved.get("NombreCuenta"),
      Dinero: saved.get("Dinero") ?? 0,
      id_usuario: { objectId: userId },
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

// Obtener cuenta por ID (DEVUELVE OBJETO PLANO con usuario expandido)
const getAccountById = async (accountId) => {
  const Cuentas = Parse.Object.extend("Cuentas");
  const q = new Parse.Query(Cuentas);
  q.equalTo("objectId", accountId);
  q.include("id_usuario"); // incluye el usuario completo

  const obj = await q.first({ useMasterKey: true });
  if (!obj) return null;

  const user = obj.get("id_usuario");

  return {
    id: obj.id,
    NombreCuenta: obj.get("NombreCuenta"),
    Dinero: obj.get("Dinero") ?? 0,
    id_usuario: user
      ? {
          objectId: user.id,
          name: pickUserName(user),                           // 👈 aquí el cambio clave
          email: user.get("email") || user.get("Correo") || "",
        }
      : null,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

// Actualizar cuenta (devuelve objeto plano)
const updateAccount = async (accountId, updates) => {
  try {
    const Cuentas = Parse.Object.extend("Cuentas");
    const query = new Parse.Query(Cuentas);
    const account = await query.get(accountId, { useMasterKey: true });
    if (!account) throw new Error("Account not found");

    if (updates.NombreCuenta) account.set("NombreCuenta", updates.NombreCuenta);
    if (updates.Dinero !== undefined) account.set("Dinero", Number(updates.Dinero) || 0);

    const updated = await account.save(null, { useMasterKey: true });

    return {
      id: updated.id,
      NombreCuenta: updated.get("NombreCuenta"),
      Dinero: updated.get("Dinero") ?? 0,
      id_usuario: updated.get("id_usuario")
        ? { objectId: updated.get("id_usuario").id }
        : null,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  } catch (error) {
    console.error("Error updating account:", error);
    throw error;
  }
};

// Eliminar cuenta
const deleteAccount = async (accountId) => {
  try {
    const Cuentas = Parse.Object.extend("Cuentas");
    const query = new Parse.Query(Cuentas);
    const account = await query.get(accountId, { useMasterKey: true });
    await account.destroy({ useMasterKey: true });
    return true;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

module.exports = {
  getAccountsByUser,
  createAccount,
  getAccountById,
  updateAccount,
  deleteAccount,
};
