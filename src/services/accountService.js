const Parse = require("../config/parseConfig");
const AccountModel = require("../models/AccountModel");



// Obtener todas las cuentas de un usuario
const getAccountsByUser = async (userId) => {
    try {
        const Account = Parse.Object.extend("Cuentas");
        const query = new Parse.Query(Account);
        
        // Buscar por referencia al usuario
        const userPointer = new Parse.Object("Usuarios");
        userPointer.id = userId;
        
        query.equalTo("id_usuario", userPointer);
        query.include("id_usuario");
        query.ascending("createdAt");
        
        const results = await query.find({ useMasterKey: true });
        
        return results.map(account => new AccountModel(
            account.id,
            account.get("id_usuario").id,
            account.get("NombreCuenta"),
            account.get("Dinero") || 0,
            account.get("createdAt"),
            account.get("updatedAt")
        ));
    } catch (error) {
        console.error("Error getting accounts:", error);
        throw error;
    }
};

// Crear nueva cuenta para un usuario
const createAccount = async (userId, accountName, initialBalance = 0) => {
    try {
        const Account = Parse.Object.extend("Cuentas");
        const account = new Account();
        
        // Crear referencia al usuario
        const userPointer = new Parse.Object("Usuarios");
        userPointer.id = userId;
        
        account.set("id_usuario", userPointer);
        account.set("NombreCuenta", accountName);
        account.set("Dinero", parseFloat(initialBalance));
        
        const savedAccount = await account.save(null, { useMasterKey: true });
        
        return new AccountModel(
            savedAccount.id,
            savedAccount.get("id_usuario").id,
            savedAccount.get("NombreCuenta"),
            savedAccount.get("Dinero"),
            savedAccount.get("createdAt"),
            savedAccount.get("updatedAt")
        );
    } catch (error) {
        console.error("Error creating account:", error);
        throw error;
    }
};

// Obtener cuenta por ID
const getAccountById = async (accountId) => {
    try {
        const Account = Parse.Object.extend("Cuentas");
        const query = new Parse.Query(Account);
        
        const account = await query.get(accountId, { useMasterKey: true });
        
        if (!account) return null;
        
        return new AccountModel(
            account.id,
            account.get("id_usuario").id,
            account.get("NombreCuenta"),
            account.get("Dinero"),
            account.get("createdAt"),
            account.get("updatedAt")
        );
    } catch (error) {
        console.error("Error getting account:", error);
        throw error;
    }
};

// Actualizar cuenta
const updateAccount = async (accountId, updates) => {
    try {
        const Account = Parse.Object.extend("Cuentas");
        const query = new Parse.Query(Account);
        
        const account = await query.get(accountId, { useMasterKey: true });
        if (!account) throw new Error("Account not found");
        
        if (updates.NombreCuenta) account.set("NombreCuenta", updates.NombreCuenta);
        if (updates.Dinero !== undefined) account.set("Dinero", parseFloat(updates.Dinero));
        
        const updatedAccount = await account.save(null, { useMasterKey: true });
    
    return new AccountModel(
        updatedAccount.id,
        updatedAccount.get("id_usuario").id,
        updatedAccount.get("NombreCuenta"),
        updatedAccount.get("Dinero"),
        updatedAccount.get("createdAt"),
        updatedAccount.get("updatedAt")
    );
    } catch (error) {
        console.error("Error updating account:", error);
        throw error;
    }
};

// Eliminar cuenta
const deleteAccount = async (accountId) => {
    try {
        const Account = Parse.Object.extend("Cuentas");
        const query = new Parse.Query(Account);
        
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
    deleteAccount
};