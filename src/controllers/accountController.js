const accountService = require("../services/accountService");

// ---- helper: serializa cualquier forma de "cuenta"
function serializeAccount(acc) {
  if (!acc) return null;

  // 1) Si viene de Parse.Object
  if (typeof acc.toJSON === 'function') return acc.toJSON();

  // 2) Si es objeto plano o modelo propio
  // normalizamos campos frecuentes
  const id =
    acc.id || acc.objectId || acc.id_cuenta || acc.accountId || null;

  // id_usuario puede venir como string, objeto pointer, u objeto con datos
  let id_usuario = acc.id_usuario ?? acc.userId ?? null;
  if (id_usuario && typeof id_usuario === 'object') {
    // pointer expandido o user embebido
    id_usuario = {
      objectId: id_usuario.objectId || id_usuario.id || id_usuario.userId || null,
      name: id_usuario.name || id_usuario.Nombre || "",
      email: id_usuario.email || id_usuario.Correo || "",
    };
  }

  return {
    id,
    NombreCuenta: acc.NombreCuenta ?? acc.name ?? acc.accountName ?? "",
    Dinero: typeof acc.Dinero === 'number' ? acc.Dinero
          : Number(acc.Dinero ?? acc.balance ?? 0),
    id_usuario,
    createdAt: acc.createdAt ?? null,
    updatedAt: acc.updatedAt ?? null,
  };
}

// GET /accounts/user/:userId
const getAccountsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }
    const accounts = await accountService.getAccountsByUser(userId);

    return res.json({
      success: true,
      accounts: Array.isArray(accounts) ? accounts.map(serializeAccount) : [],
    });
  } catch (error) {
    console.error("Error in getAccountsByUser:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// POST /accounts
const createAccount = async (req, res) => {
  try {
    const { userId, accountName, initialBalance } = req.body;
    if (!userId || !accountName) {
      return res.status(400).json({
        success: false,
        error: "User ID and account name are required",
      });
    }

    const newAccount = await accountService.createAccount(
      userId,
      accountName,
      initialBalance ?? 0
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      account: serializeAccount(newAccount),
    });
  } catch (error) {
    console.error("Error in createAccount:", error);
    return res
      .status(400)
      .json({ success: false, error: error.message || "Error creating account" });
  }
};

// GET /accounts/:accountId
const getAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const account = await accountService.getAccountById(accountId);
    if (!account) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }
    return res.json({ success: true, account: serializeAccount(account) });
  } catch (error) {
    console.error("Error in getAccount:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /accounts/:accountId
const updateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const updates = req.body;
    const updatedAccount = await accountService.updateAccount(accountId, updates);
    return res.json({
      success: true,
      message: "Account updated successfully",
      account: serializeAccount(updatedAccount),
    });
  } catch (error) {
    console.error("Error in updateAccount:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// DELETE /accounts/:accountId
const deleteAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    await accountService.deleteAccount(accountId);
    return res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAccountsByUser,
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
};
