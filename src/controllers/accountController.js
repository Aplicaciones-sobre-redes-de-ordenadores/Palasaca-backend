const accountService = require("../services/accountService");

// GET /accounts/user/:userId
const getAccountsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ 
                success: false,
                error: "User ID is required" 
            });
        }

        const accounts = await accountService.getAccountsByUser(userId);
        
        res.json({
            success: true,
            accounts: accounts.map(account => account.toJSON())
        });
    } catch (error) {
        console.error("Error in getAccountsByUser:", error);
        res.status(500).json({ 
        success: false,
        error: error.message 
        });
    }
};

// POST /accounts
const createAccount = async (req, res) => {
    try {
        const { userId, accountName, initialBalance } = req.body;
        
        // Validaciones
        if (!userId || !accountName) {
            return res.status(400).json({ 
                success: false,
                error: "User ID and account name are required" 
            });
        }

        const newAccount = await accountService.createAccount(
        userId, 
        accountName, 
        initialBalance || 0
        );
        
        res.status(201).json({
            success: true,
            message: "Account created successfully",
            account: newAccount.toJSON()
        });
    } catch (error) {
        console.error("Error in createAccount:", error);
        res.status(500).json({ 
        success: false,
        error: error.message 
        });
    }
};

// GET /accounts/:accountId
const getAccountById = async (req, res) => {
    try {
        const { accountId } = req.params;
        
        const account = await accountService.getAccountById(accountId);
        
        if (!account) {
            return res.status(404).json({ 
                success: false,
                error: "Account not found" 
            });
        }
        
        res.json({
            success: true,
            account: account.toJSON()
            });
    } catch (error) {
        console.error("Error in getAccount:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// PUT /accounts/:accountId
const updateAccount = async (req, res) => {
    try {
        const { accountId } = req.params;
        const updates = req.body;
        
        const updatedAccount = await accountService.updateAccount(accountId, updates);
        
        res.json({
            success: true,
            message: "Account updated successfully",
            account: updatedAccount.toJSON()
        });
    } catch (error) {
        console.error("Error in updateAccount:", error);
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};

// DELETE /accounts/:accountId
const deleteAccount = async (req, res) => {
    try {
        const { accountId } = req.params;
        
        await accountService.deleteAccount(accountId);
        
        res.json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error("Error in deleteAccount:", error);
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};

module.exports = {
    getAccountsByUser,
    createAccount,
    getAccountById,
    updateAccount,
    deleteAccount
};