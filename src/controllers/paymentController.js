const paymentService = require("../services/paymentService");

// GET /api/payments/account/:accountId
const getPaymentsByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!accountId) {
      return res.status(400).json({ success: false, error: "Account ID es requerido" });
    }

    const payments = await paymentService.getPaymentsByAccount(accountId);

    res.json({
      success: true,
      payments: payments.map(payment => payment.toJSON())
    });
  } catch (error) {
    console.error("Error en getPaymentsByAccount:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /payments
const createPayment = async (req, res) => {
  try {
    const { accountId, nombre, importe, tipo, fecha_limite, recordatorio, Comentarios } = req.body;

    // Validaciones
    if (!accountId || !nombre || !importe || !fecha_limite) {
      return res.status(400).json({ 
        success: false, 
        error: "Account ID, nombre, importe y fecha_limite son requeridos." 
      });
    }

    const importeValidado = parseFloat(importe);
    if (isNaN(importeValidado) || importeValidado <= 0) {
        return res.status(400).json({ success: false, error: "El importe debe ser un número positivo válido." });
    }

    const fechaLimiteValidada = new Date(fecha_limite);
    if (isNaN(fechaLimiteValidada) || fechaLimiteValidada < new Date().setHours(0,0,0,0)) {
        return res.status(400).json({ success: false, error: "Formato de fecha_limite inválido." });
    }

    const newPayment = await paymentService.createPayment(accountId, {
      nombre,
      importe: importeValidado,
      tipo: tipo || "Otros",
      fecha_limite: fechaLimiteValidada,
      recordatorio: recordatorio || false,
      Comentarios
    });

    res.status(201).json({
      success: true,
      message: "Pago creado exitosamente.",
      payment: newPayment.toJSON()
    });
  } catch (error) {
    console.error("Error en createPayment:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// PUT /api/payments/:paymentId/status
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { newStatus } = req.body;
    console.log("New Status:", newStatus);
    if (!newStatus || !["Pendiente", "Pagado", "Vencido"].includes(newStatus)) {
      return res.status(400).json({ 
        success: false, 
        error: "Estado no válido. Debe ser 'Pendiente', 'Pagado' o 'Vencido'." 
      });
    }

    const updatedPayment = await paymentService.updatePaymentStatus(paymentId, newStatus);

    res.json({
      success: true,
      message: "Estado de pago actualizado exitosamente.",
      payment: updatedPayment.toJSON()
    });
  } catch (error) {
    console.error("Error en updatePaymentStatus:", error);
    res.status(404).json({ success: false, error: error.message });
  }
};

const updatePaymentReminder = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { recordatorio } = req.body;

    const updatedPayment = await paymentService.updateReminder(paymentId);

    res.json({
      success: true,
      message: "Recordatorio de pago actualizado exitosamente.",
      payment: updatedPayment.toJSON()
    });
  } catch (error) {
    console.error("Error en updatePaymentReminder:", error);
    res.status(404).json({ success: false, error: error.message });
  }
};

// DELETE /api/payments/:paymentId
const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ success: false, error: "Payment ID es requerido." });
    }
    
    await paymentService.deletePayment(paymentId);

    res.status(200).json({
      success: true,
      message: "Pago eliminado exitosamente."
    });
  } catch (error) {
    console.error("Error en deletePayment:", error);
    res.status(404).json({ success: false, error: error.message });
  }
};

const checkOverduePayments = async (req, res) => {
    try {
        const result = await paymentService.checkAndSetOverduePayments();

        res.json({ success: true, ...result });
    } catch (error) {
        console.error("Error en checkOverduePayments:", error);
        res.status(500).json({ success: false, error: "Error al verificar pagos vencidos." });
    }
};

module.exports = {
  getPaymentsByAccount,
  createPayment,
  updatePaymentStatus,
  deletePayment,
  updatePaymentReminder
};