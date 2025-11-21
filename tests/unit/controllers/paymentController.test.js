// tests/unit/controllers/paymentController.test.js
const {
  getPaymentsByAccount,
  createPayment,
  updatePaymentStatus,
  deletePayment,
  updatePaymentReminder,
} = require('../../../src/controllers/paymentController');

jest.mock('../../../src/services/paymentService', () => ({
  getPaymentsByAccount: jest.fn(),
  createPayment: jest.fn(),
  updatePaymentStatus: jest.fn(),
  deletePayment: jest.fn(),
  checkAndSetOverduePayments: jest.fn(),
  updateReminder: jest.fn(),
}));

const paymentService = require('../../../src/services/paymentService');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe('paymentController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /api/payments/account/:accountId
  describe('getPaymentsByAccount', () => {
    test('devuelve 400 si falta accountId', async () => {
      const req = { params: {} };
      const res = mockResponse();

      await getPaymentsByAccount(req, res);

      expect(paymentService.getPaymentsByAccount).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Account ID es requerido',
      });
    });

    test('devuelve 200 y lista de pagos si todo va bien', async () => {
      const fakePayments = [
        {
          toJSON: () => ({
            id_pago: 'p1',
            id_cuenta: 'acc1',
            nombre: 'Luz',
            importe: 50,
            tipo: 'Gasto',
            fecha_limite: '2024-01-10',
            estado: 'Pendiente',
            recordatorio: false,
            Comentarios: '',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
          }),
        },
        {
          toJSON: () => ({
            id_pago: 'p2',
            id_cuenta: 'acc1',
            nombre: 'Internet',
            importe: 30,
            tipo: 'Gasto',
            fecha_limite: '2024-01-15',
            estado: 'Pagado',
            recordatorio: true,
            Comentarios: 'Fibra',
            createdAt: '2024-01-03',
            updatedAt: '2024-01-04',
          }),
        },
      ];

      paymentService.getPaymentsByAccount.mockResolvedValue(fakePayments);

      const req = { params: { accountId: 'acc1' } };
      const res = mockResponse();

      await getPaymentsByAccount(req, res);

      expect(paymentService.getPaymentsByAccount).toHaveBeenCalledWith('acc1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        payments: [
          {
            id_pago: 'p1',
            id_cuenta: 'acc1',
            nombre: 'Luz',
            importe: 50,
            tipo: 'Gasto',
            fecha_limite: '2024-01-10',
            estado: 'Pendiente',
            recordatorio: false,
            Comentarios: '',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
          },
          {
            id_pago: 'p2',
            id_cuenta: 'acc1',
            nombre: 'Internet',
            importe: 30,
            tipo: 'Gasto',
            fecha_limite: '2024-01-15',
            estado: 'Pagado',
            recordatorio: true,
            Comentarios: 'Fibra',
            createdAt: '2024-01-03',
            updatedAt: '2024-01-04',
          },
        ],
      });
    });

    test('devuelve 500 si el servicio lanza un error', async () => {
      paymentService.getPaymentsByAccount.mockRejectedValue(
        new Error('db error')
      );

      const req = { params: { accountId: 'acc1' } };
      const res = mockResponse();

      await getPaymentsByAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'db error',
      });
    });
  });

  // POST /payments
  describe('createPayment', () => {
    test('devuelve 400 si faltan campos obligatorios', async () => {
      const req = {
        body: {
          // falta accountId, o nombre, o importe, o fecha_limite
          accountId: 'acc1',
          nombre: 'Luz',
          // sin importe
          fecha_limite: '2099-01-01',
        },
      };
      const res = mockResponse();

      await createPayment(req, res);

      expect(paymentService.createPayment).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error:
          'Account ID, nombre, importe y fecha_limite son requeridos.',
      });
    });

    test('devuelve 400 si el importe no es válido', async () => {
      const req = {
        body: {
          accountId: 'acc1',
          nombre: 'Luz',
          importe: '-10', // negativo
          fecha_limite: '2099-01-01',
        },
      };
      const res = mockResponse();

      await createPayment(req, res);

      expect(paymentService.createPayment).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'El importe debe ser un número positivo válido.',
      });
    });

    test('devuelve 400 si la fecha_limite es inválida (pasada)', async () => {
      const req = {
        body: {
          accountId: 'acc1',
          nombre: 'Luz',
          importe: '50',
          fecha_limite: '2000-01-01', // fecha antigua
        },
      };
      const res = mockResponse();

      await createPayment(req, res);

      expect(paymentService.createPayment).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Formato de fecha_limite inválido.',
      });
    });

    test('devuelve 201 y el pago creado si todo va bien (con defaults)', async () => {
      const body = {
        accountId: 'acc1',
        nombre: 'Luz',
        importe: '50',
        // sin tipo -> "Otros"
        fecha_limite: '2099-01-01',
        // sin recordatorio -> false
        // sin Comentarios
      };

      const fakePayment = {
        toJSON: () => ({
          id_pago: 'p1',
          id_cuenta: 'acc1',
          nombre: 'Luz',
          importe: 50,
          tipo: 'Otros',
          fecha_limite: new Date('2099-01-01'),
          estado: 'Pendiente',
          recordatorio: false,
          Comentarios: '',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        }),
      };

      paymentService.createPayment.mockResolvedValue(fakePayment);

      const req = { body };
      const res = mockResponse();

      await createPayment(req, res);

      // comprobamos que construye bien el objeto para el service
      expect(paymentService.createPayment).toHaveBeenCalledWith(
        'acc1',
        expect.objectContaining({
          nombre: 'Luz',
          importe: 50,
          tipo: 'Otros',
          recordatorio: false,
          // fecha_limite será un Date, no comparamos exactamente el objeto
          fecha_limite: expect.any(Date),
        })
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Pago creado exitosamente.',
        payment: {
          id_pago: 'p1',
          id_cuenta: 'acc1',
          nombre: 'Luz',
          importe: 50,
          tipo: 'Otros',
          fecha_limite: new Date('2099-01-01'),
          estado: 'Pendiente',
          recordatorio: false,
          Comentarios: '',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
      });
    });

    test('devuelve 400 si el servicio lanza un error', async () => {
      paymentService.createPayment.mockRejectedValue(
        new Error('create error')
      );

      const req = {
        body: {
          accountId: 'acc1',
          nombre: 'Luz',
          importe: '50',
          fecha_limite: '2099-01-01',
        },
      };
      const res = mockResponse();

      await createPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'create error',
      });
    });
  });

  // PUT /api/payments/:paymentId/status
  describe('updatePaymentStatus', () => {
    test('devuelve 400 si el estado es inválido', async () => {
      const req = {
        params: { paymentId: 'p1' },
        body: { newStatus: 'Otro' },
      };
      const res = mockResponse();

      await updatePaymentStatus(req, res);

      expect(paymentService.updatePaymentStatus).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error:
          "Estado no válido. Debe ser 'Pendiente', 'Pagado' o 'Vencido'.",
      });
    });

    test('devuelve 200 y el pago actualizado si todo va bien', async () => {
      const fakePayment = {
        toJSON: () => ({
          id_pago: 'p1',
          id_cuenta: 'acc1',
          nombre: 'Luz',
          importe: 50,
          tipo: 'Gasto',
          fecha_limite: new Date('2099-01-01'),
          estado: 'Pagado',
          recordatorio: false,
          Comentarios: '',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-03',
        }),
      };

      paymentService.updatePaymentStatus.mockResolvedValue(fakePayment);

      const req = {
        params: { paymentId: 'p1' },
        body: { newStatus: 'Pagado' },
      };
      const res = mockResponse();

      await updatePaymentStatus(req, res);

      expect(paymentService.updatePaymentStatus).toHaveBeenCalledWith(
        'p1',
        'Pagado'
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Estado de pago actualizado exitosamente.',
        payment: {
          id_pago: 'p1',
          id_cuenta: 'acc1',
          nombre: 'Luz',
          importe: 50,
          tipo: 'Gasto',
          fecha_limite: new Date('2099-01-01'),
          estado: 'Pagado',
          recordatorio: false,
          Comentarios: '',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-03',
        },
      });
    });

    test('devuelve 404 si el servicio lanza un error', async () => {
      paymentService.updatePaymentStatus.mockRejectedValue(
        new Error('status error')
      );

      const req = {
        params: { paymentId: 'p1' },
        body: { newStatus: 'Pagado' },
      };
      const res = mockResponse();

      await updatePaymentStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'status error',
      });
    });
  });

  // PUT /api/payments/:paymentId/reminder (updatePaymentReminder)
  describe('updatePaymentReminder', () => {
    test('devuelve 200 y el pago actualizado si todo va bien', async () => {
      const fakePayment = {
        toJSON: () => ({
          id_pago: 'p1',
          id_cuenta: 'acc1',
          nombre: 'Luz',
          importe: 50,
          tipo: 'Gasto',
          fecha_limite: new Date('2099-01-01'),
          estado: 'Pendiente',
          recordatorio: true,
          Comentarios: '',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        }),
      };

      paymentService.updateReminder.mockResolvedValue(fakePayment);

      const req = {
        params: { paymentId: 'p1' },
        body: { recordatorio: true },
      };
      const res = mockResponse();

      await updatePaymentReminder(req, res);

      expect(paymentService.updateReminder).toHaveBeenCalledWith('p1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Recordatorio de pago actualizado exitosamente.',
        payment: {
          id_pago: 'p1',
          id_cuenta: 'acc1',
          nombre: 'Luz',
          importe: 50,
          tipo: 'Gasto',
          fecha_limite: new Date('2099-01-01'),
          estado: 'Pendiente',
          recordatorio: true,
          Comentarios: '',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
      });
    });

    test('devuelve 404 si el servicio lanza un error', async () => {
      paymentService.updateReminder.mockRejectedValue(
        new Error('reminder error')
      );

      const req = {
        params: { paymentId: 'p1' },
        body: { recordatorio: false },
      };
      const res = mockResponse();

      await updatePaymentReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'reminder error',
      });
    });
  });

  // DELETE /api/payments/:paymentId
  describe('deletePayment', () => {
    test('devuelve 400 si falta paymentId', async () => {
      const req = { params: {} };
      const res = mockResponse();

      await deletePayment(req, res);

      expect(paymentService.deletePayment).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Payment ID es requerido.',
      });
    });

    test('devuelve 200 si el pago se elimina correctamente', async () => {
      paymentService.deletePayment.mockResolvedValue({
        success: true,
        message: 'Pago p1 eliminado.',
      });

      const req = { params: { paymentId: 'p1' } };
      const res = mockResponse();

      await deletePayment(req, res);

      expect(paymentService.deletePayment).toHaveBeenCalledWith('p1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Pago eliminado exitosamente.',
      });
    });

    test('devuelve 404 si el servicio lanza un error', async () => {
      paymentService.deletePayment.mockRejectedValue(
        new Error('delete error')
      );

      const req = { params: { paymentId: 'p1' } };
      const res = mockResponse();

      await deletePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'delete error',
      });
    });
  });
});
