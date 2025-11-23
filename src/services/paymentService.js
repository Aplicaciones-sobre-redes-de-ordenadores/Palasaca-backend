const Parse = require("../config/parseConfig.js"); 
const PaymentModel = require("../models/PaymentModel.js");

const Payment = Parse.Object.extend("Pagos");


const mapToModel = (payment) => {
  return new PaymentModel(
    payment.id,
    payment.get("id_cuenta").id,
    payment.get("nombre"),
    payment.get("importe"),
    payment.get("tipo"),
    payment.get("fecha_limite"),
    payment.get("estado"),
    payment.get("recordatorio") || false, 
    payment.get("Comentarios"),
    payment.get("createdAt"),
    payment.get("updatedAt")
  );
};

const getTotalPaymentsCount = async () => {
  try {
    const query = new Parse.Query(Payment);
    return await query.count({ useMasterKey: true });
  } catch (error) {
    console.error("Error al obtener el conteo total de pagos:", error);
    throw error;
  }
};

const getPaymentsByAccount = async (accountId) => {
  try {
    const query = new Parse.Query(Payment);

    const accountPointer = new Parse.Object("Cuentas");
    accountPointer.id = accountId;

    query.equalTo("id_cuenta", accountPointer);
    query.descending("fecha_limite"); 

    const results = await query.find({ useMasterKey: true });

    return results.map(mapToModel);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    throw error;
  }
};

const createPayment = async (accountId, paymentData) => {
  try {
    const payment = new Payment();

    const accountPointer = new Parse.Object("Cuentas");
    accountPointer.id = accountId;

    payment.set("id_cuenta", accountPointer);
    payment.set("nombre", paymentData.nombre);
    payment.set("importe", parseFloat(paymentData.importe));
    payment.set("tipo", paymentData.tipo);
    payment.set("fecha_limite", new Date(paymentData.fecha_limite)); 
    payment.set("estado", "Pendiente"); 
    payment.set("recordatorio", paymentData.recordatorio || false);
    payment.set("Comentarios", paymentData.Comentarios || "");

    const savedPayment = await payment.save(null, { useMasterKey: true });

    savedPayment.set("id_cuenta", accountPointer);

    return mapToModel(savedPayment);

  } catch (error) {
    console.error("Error al crear pago:", error);
    throw error;
  }
};


const updatePaymentStatus = async (paymentId, newStatus) => {
  try {
    if (!paymentId) {
      console.error("Error: Payment ID es 'undefined' en req.params.");
      return res.status(400).json({
        success: false,
        error: "Payment ID es requerido en la ruta. Asegúrate de que el frontend lo esté enviando correctamente."
      });
    }
    const query = new Parse.Query(Payment);
    const payment = await query.get(paymentId, { useMasterKey: true });

    if (!payment) {
      throw new Error("Pago no encontrado");
    }

    payment.set("estado", newStatus);
    const savedPayment = await payment.save(null, { useMasterKey: true });
    
    const accountId = payment.get("id_cuenta").id;
    savedPayment.set("id_cuenta", new Parse.Object("Cuentas", { id: accountId }));
    return mapToModel(savedPayment);
  } catch (error) {
    console.error("Error al actualizar estado del pago:", error);
    throw error;
  }
};

const updateReminder = async (paymentId) => {
  try {
    if (!paymentId) {
      console.error("Error: Payment ID es 'undefined' en req.params.");
      return res.status(400).json({
        success: false,
        error: "Payment ID es requerido en la ruta. Asegúrate de que el frontend lo esté enviando correctamente."
      });
    }
    const query = new Parse.Query(Payment);
    const payment = await query.get(paymentId, { useMasterKey: true });

    if (!payment) {
      throw new Error("Pago no encontrado");
    }

    const currentReminder = payment.get("recordatorio");
    payment.set("recordatorio", !currentReminder);
    const savedPayment = await payment.save(null, { useMasterKey: true });
    
    const accountId = payment.get("id_cuenta").id;
    savedPayment.set("id_cuenta", new Parse.Object("Cuentas", { id: accountId }));
    return mapToModel(savedPayment);
  } catch (error) {
    console.error("Error al actualizar estado del pago:", error);
    throw error;
  }
};


const deletePayment = async (paymentId) => {
  try {
    const query = new Parse.Query(Payment);
    const payment = await query.get(paymentId, { useMasterKey: true });

    if (!payment) {
      throw new Error("Pago no encontrado");
    }

    await payment.destroy({ useMasterKey: true });
    return { success: true, message: `Pago ${paymentId} eliminado.` };
  } catch (error) {
    console.error("Error al eliminar pago:", error);
    throw error;
  }
};

// --- Función de Lógica de Vencimiento (Puede ejecutarse vía Cloud Job o por el cliente desde Frontend) ---

const checkAndSetOverduePayments = async () => {
  try {
    const today = new Date();
    // Establecer la hora a medianoche (00:00:00) para una comparación precisa
    today.setHours(0, 0, 0, 0); 
    const query = new Parse.Query(Payment);
  
    // Buscar pagos 'Pendientes' con fecha_limite anterior a hoy
    query.equalTo("estado", "Pendiente");
    query.lessThan("fecha_limite", today);

    const overduePayments = await query.find({ useMasterKey: true });
    
    if (overduePayments.length === 0) {
      return { count: 0, message: "No se encontraron pagos vencidos para actualizar." };
    }

    const promises = overduePayments.map(payment => {
      payment.set("estado", "Vencido");
      return payment.save(null, { useMasterKey: true });
    });

    await Promise.all(promises);
    
    return { count: overduePayments.length, message: `Se actualizaron ${overduePayments.length} pagos a 'Vencido'.` };

  } catch (error) {
    console.error("Error al verificar pagos vencidos:", error);
    throw error;
  }
};

module.exports = {
  getPaymentsByAccount,
  createPayment,
  updatePaymentStatus,
  deletePayment,
  checkAndSetOverduePayments,
  updateReminder,
  getTotalPaymentsCount
};