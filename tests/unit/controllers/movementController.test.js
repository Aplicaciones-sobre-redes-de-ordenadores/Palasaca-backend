// tests/unit/controllers/movementController.test.js

const {
  getMovementsByAccount,
  createMovement,
} = require('../../../src/controllers/movementController');

jest.mock('../../../src/services/movementService', () => ({
  getMovementsByAccount: jest.fn(),
  createMovement: jest.fn(),
  updateAccountBalance: jest.fn(),
}));

const movementService = require('../../../src/services/movementService');

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

describe('movementController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /movements/account/:accountId
  describe('getMovementsByAccount', () => {
    test('devuelve 400 si falta accountId', async () => {
      const req = { params: {} };
      const res = mockResponse();

      await getMovementsByAccount(req, res);

      expect(movementService.getMovementsByAccount).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Account ID is required',
      });
    });

    test('devuelve 200 y lista de movimientos si todo va bien', async () => {
      const fakeMovements = [
        {
          toJSON: () => ({
            id_movimiento: 'm1',
            id_cuenta: 'acc1',
            Tipo: 'gasto',
            Fijo: false,
            Categoria: 'Comida',
            Comentarios: 'Cena',
            Cantidad: -20,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
          }),
        },
        {
          toJSON: () => ({
            id_movimiento: 'm2',
            id_cuenta: 'acc1',
            Tipo: 'ingreso',
            Fijo: false,
            Categoria: 'Trabajo',
            Comentarios: '',
            Cantidad: 1000,
            createdAt: '2024-01-03',
            updatedAt: '2024-01-04',
          }),
        },
      ];

      movementService.getMovementsByAccount.mockResolvedValue(fakeMovements);

      const req = { params: { accountId: 'acc1' } };
      const res = mockResponse();

      await getMovementsByAccount(req, res);

      expect(movementService.getMovementsByAccount).toHaveBeenCalledWith('acc1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        movements: [
          {
            id_movimiento: 'm1',
            id_cuenta: 'acc1',
            Tipo: 'gasto',
            Fijo: false,
            Categoria: 'Comida',
            Comentarios: 'Cena',
            Cantidad: -20,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
          },
          {
            id_movimiento: 'm2',
            id_cuenta: 'acc1',
            Tipo: 'ingreso',
            Fijo: false,
            Categoria: 'Trabajo',
            Comentarios: '',
            Cantidad: 1000,
            createdAt: '2024-01-03',
            updatedAt: '2024-01-04',
          },
        ],
      });
    });

    test('devuelve 500 si el servicio lanza un error', async () => {
      movementService.getMovementsByAccount.mockRejectedValue(new Error('db error'));

      const req = { params: { accountId: 'acc1' } };
      const res = mockResponse();

      await getMovementsByAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'db error',
      });
    });
  });

  // POST /movements
  describe('createMovement', () => {
    test('devuelve 400 si faltan accountId, Tipo o Cantidad', async () => {
      const req = {
        body: {
          // falta accountId
          Tipo: 'gasto',
          Cantidad: 10,
        },
      };
      const res = mockResponse();

      await createMovement(req, res);

      expect(movementService.createMovement).not.toHaveBeenCalled();
      expect(movementService.updateAccountBalance).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Account ID, Tipo and Cantidad are required',
      });
    });

    test('devuelve 400 si el Tipo no es gasto ni ingreso', async () => {
      const req = {
        body: {
          accountId: 'acc1',
          Tipo: 'otraCosa',
          Cantidad: 10,
        },
      };
      const res = mockResponse();

      await createMovement(req, res);

      expect(movementService.createMovement).not.toHaveBeenCalled();
      expect(movementService.updateAccountBalance).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Tipo must be 'gasto' or 'ingreso'",
      });
    });

    test('crea un gasto con cantidad positiva ajustando a negativa y defaults', async () => {
      const fakeMovement = {
        toJSON: () => ({
          id_movimiento: 'm1',
          id_cuenta: 'acc1',
          Tipo: 'gasto',
          Fijo: false,
          Categoria: 'Otros',
          Comentarios: '',
          Cantidad: -50,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        }),
      };

      movementService.createMovement.mockResolvedValue(fakeMovement);
      movementService.updateAccountBalance.mockResolvedValue(-50);

      const req = {
        body: {
          accountId: 'acc1',
          Tipo: 'gasto',
          Cantidad: 50, // positiva
          // sin Fijo, sin Categoria, sin Comentarios
        },
      };
      const res = mockResponse();

      await createMovement(req, res);

      // Cantidad debe convertirse a -50, Fijo=false, Categoria='Otros', Comentarios=''
      expect(movementService.createMovement).toHaveBeenCalledWith('acc1', {
        Tipo: 'gasto',
        Cantidad: -50,
        Fijo: false,
        Categoria: 'Otros',
        Comentarios: '',
      });

      expect(movementService.updateAccountBalance).toHaveBeenCalledWith('acc1', -50);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Movement created successfully',
        movement: {
          id_movimiento: 'm1',
          id_cuenta: 'acc1',
          Tipo: 'gasto',
          Fijo: false,
          Categoria: 'Otros',
          Comentarios: '',
          Cantidad: -50,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
      });
    });

    test('crea un ingreso con cantidad negativa ajustando a positiva', async () => {
      const fakeMovement = {
        toJSON: () => ({
          id_movimiento: 'm2',
          id_cuenta: 'acc1',
          Tipo: 'ingreso',
          Fijo: true,
          Categoria: 'Nómina',
          Comentarios: 'Enero',
          Cantidad: 1000,
          createdAt: '2024-02-01',
          updatedAt: '2024-02-02',
        }),
      };

      movementService.createMovement.mockResolvedValue(fakeMovement);
      movementService.updateAccountBalance.mockResolvedValue(1000);

      const req = {
        body: {
          accountId: 'acc1',
          Tipo: 'ingreso',
          Cantidad: -1000,    // viene negativa
          Fijo: true,
          Categoria: 'Nómina',
          Comentarios: 'Enero',
        },
      };
      const res = mockResponse();

      await createMovement(req, res);

      // Cantidad debe convertirse a +1000
      expect(movementService.createMovement).toHaveBeenCalledWith('acc1', {
        Tipo: 'ingreso',
        Cantidad: 1000,
        Fijo: true,
        Categoria: 'Nómina',
        Comentarios: 'Enero',
      });

      expect(movementService.updateAccountBalance).toHaveBeenCalledWith('acc1', 1000);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Movement created successfully',
        movement: {
          id_movimiento: 'm2',
          id_cuenta: 'acc1',
          Tipo: 'ingreso',
          Fijo: true,
          Categoria: 'Nómina',
          Comentarios: 'Enero',
          Cantidad: 1000,
          createdAt: '2024-02-01',
          updatedAt: '2024-02-02',
        },
      });
    });

    test('devuelve 400 si el servicio lanza un error', async () => {
      movementService.createMovement.mockRejectedValue(new Error('create error'));

      const req = {
        body: {
          accountId: 'acc1',
          Tipo: 'gasto',
          Cantidad: 10,
        },
      };
      const res = mockResponse();

      await createMovement(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'create error',
      });
    });

    test('devuelve 400 si falla la actualización de saldo', async () => {
      const fakeMovement = {
        toJSON: () => ({
          id_movimiento: 'm3',
          id_cuenta: 'acc1',
          Tipo: 'ingreso',
          Fijo: false,
          Categoria: 'Otros',
          Comentarios: '',
          Cantidad: 20,
          createdAt: '2024-03-01',
          updatedAt: '2024-03-02',
        }),
      };

      movementService.createMovement.mockResolvedValue(fakeMovement);
      movementService.updateAccountBalance.mockRejectedValue(
        new Error('balance error')
      );

      const req = {
        body: {
          accountId: 'acc1',
          Tipo: 'ingreso',
          Cantidad: 20,
        },
      };
      const res = mockResponse();

      await createMovement(req, res);

      expect(movementService.createMovement).toHaveBeenCalled();
      expect(movementService.updateAccountBalance).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'balance error',
      });
    });
  });
});
