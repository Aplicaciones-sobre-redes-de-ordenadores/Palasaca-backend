// tests/unit/controllers/bolsaController.test.js

const {
  getAllBolsas,
  createBolsa,
  getBolsa,
  updateBolsa,
  deleteBolsa,
} = require('../../../src/controllers/bolsaController');

jest.mock('../../../src/services/bolsaService', () => ({
  getAllBolsas: jest.fn(),
  createBolsa: jest.fn(),
  getBolsaById: jest.fn(),
  updateBolsa: jest.fn(),
  deleteBolsa: jest.fn(),
}));

const bolsaService = require('../../../src/services/bolsaService');

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

describe('bolsaController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /bolsa
  describe('getAllBolsas', () => {
    test('devuelve lista de bolsas con success true', async () => {
      const fakeBolsas = [
        {
          toJSON: () => ({
            id: '1',
            codigo: 'ABC',
            empresa: 'Empresa 1',
            nombre: 'Nombre 1',
            url_imagen: 'http://img1',
            precio: 10.5,
            variacionPrecio: 1.2,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
          }),
        },
        {
          toJSON: () => ({
            id: '2',
            codigo: 'DEF',
            empresa: 'Empresa 2',
            nombre: 'Nombre 2',
            url_imagen: 'http://img2',
            precio: 20,
            variacionPrecio: -0.5,
            createdAt: '2024-02-01',
            updatedAt: '2024-02-02',
          }),
        },
      ];

      bolsaService.getAllBolsas.mockResolvedValue(fakeBolsas);

      const req = {};
      const res = mockResponse();

      await getAllBolsas(req, res);

      expect(bolsaService.getAllBolsas).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        bolsas: [
          {
            id: '1',
            codigo: 'ABC',
            empresa: 'Empresa 1',
            nombre: 'Nombre 1',
            url_imagen: 'http://img1',
            precio: 10.5,
            variacionPrecio: 1.2,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
          },
          {
            id: '2',
            codigo: 'DEF',
            empresa: 'Empresa 2',
            nombre: 'Nombre 2',
            url_imagen: 'http://img2',
            precio: 20,
            variacionPrecio: -0.5,
            createdAt: '2024-02-01',
            updatedAt: '2024-02-02',
          },
        ],
      });
    });

    test('devuelve 500 si el servicio lanza un error', async () => {
      bolsaService.getAllBolsas.mockRejectedValue(new Error('db error'));

      const req = {};
      const res = mockResponse();

      await getAllBolsas(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'db error',
      });
    });
  });

  // POST /bolsa
  describe('createBolsa', () => {
    test('devuelve 201 y la bolsa creada si todo va bien', async () => {
      const body = {
        codigo: 'ABC',
        empresa: 'Empresa 1',
        nombre: 'Nombre 1',
        url_imagen: 'http://img',
        precio: 10.5,
        VariacionPrecioDiario: 0.8,
      };

      const fakeBolsa = {
        toJSON: () => ({
          id: '1',
          codigo: 'ABC',
          empresa: 'Empresa 1',
          nombre: 'Nombre 1',
          url_imagen: 'http://img',
          precio: 10.5,
          variacionPrecio: 0.8,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        }),
      };

      bolsaService.createBolsa.mockResolvedValue(fakeBolsa);

      const req = { body };
      const res = mockResponse();

      await createBolsa(req, res);

      expect(bolsaService.createBolsa).toHaveBeenCalledWith(body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        bolsa: {
          id: '1',
          codigo: 'ABC',
          empresa: 'Empresa 1',
          nombre: 'Nombre 1',
          url_imagen: 'http://img',
          precio: 10.5,
          variacionPrecio: 0.8,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
      });
    });

    test('devuelve 400 si el servicio lanza un error', async () => {
      bolsaService.createBolsa.mockRejectedValue(new Error('create error'));

      const req = {
        body: {
          codigo: 'ABC',
          empresa: 'Empresa 1',
          nombre: 'Nombre 1',
          url_imagen: 'http://img',
          precio: 10.5,
        },
      };
      const res = mockResponse();

      await createBolsa(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'create error',
      });
    });
  });

  // GET /bolsa/:bolsaId
  describe('getBolsa', () => {
    test('devuelve 200 y la bolsa si existe', async () => {
      const fakeBolsa = {
        toJSON: () => ({
          id: '1',
          codigo: 'ABC',
          empresa: 'Empresa 1',
          nombre: 'Nombre 1',
          url_imagen: 'http://img',
          precio: 10.5,
          variacionPrecio: 0.8,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        }),
      };

      bolsaService.getBolsaById.mockResolvedValue(fakeBolsa);

      const req = { params: { bolsaId: '1' } };
      const res = mockResponse();

      await getBolsa(req, res);

      expect(bolsaService.getBolsaById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        bolsa: {
          id: '1',
          codigo: 'ABC',
          empresa: 'Empresa 1',
          nombre: 'Nombre 1',
          url_imagen: 'http://img',
          precio: 10.5,
          variacionPrecio: 0.8,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
      });
    });

    test('devuelve 404 si el servicio lanza un error (no encontrada)', async () => {
      bolsaService.getBolsaById.mockRejectedValue(new Error('Not found'));

      const req = { params: { bolsaId: '1' } };
      const res = mockResponse();

      await getBolsa(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not found',
      });
    });
  });

  // PUT /bolsa/:bolsaId
  describe('updateBolsa', () => {
    test('devuelve 200 y la bolsa actualizada si todo va bien', async () => {
      const updates = {
        nombre: 'Nuevo nombre',
        precio: 20,
      };

      const fakeBolsa = {
        toJSON: () => ({
          id: '1',
          codigo: 'ABC',
          empresa: 'Empresa 1',
          nombre: 'Nuevo nombre',
          url_imagen: 'http://img',
          precio: 20,
          variacionPrecio: 0.8,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-03',
        }),
      };

      bolsaService.updateBolsa.mockResolvedValue(fakeBolsa);

      const req = { params: { bolsaId: '1' }, body: updates };
      const res = mockResponse();

      await updateBolsa(req, res);

      expect(bolsaService.updateBolsa).toHaveBeenCalledWith('1', updates);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        bolsa: {
          id: '1',
          codigo: 'ABC',
          empresa: 'Empresa 1',
          nombre: 'Nuevo nombre',
          url_imagen: 'http://img',
          precio: 20,
          variacionPrecio: 0.8,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-03',
        },
      });
    });

    test('devuelve 400 si el servicio lanza un error', async () => {
      bolsaService.updateBolsa.mockRejectedValue(new Error('update error'));

      const req = {
        params: { bolsaId: '1' },
        body: { nombre: 'Nuevo nombre' },
      };
      const res = mockResponse();

      await updateBolsa(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'update error',
      });
    });
  });

  // DELETE /bolsa/:bolsaId
  describe('deleteBolsa', () => {
    test('devuelve success true y mensaje si se elimina correctamente', async () => {
      bolsaService.deleteBolsa.mockResolvedValue(true);

      const req = { params: { bolsaId: '1' } };
      const res = mockResponse();

      await deleteBolsa(req, res);

      expect(bolsaService.deleteBolsa).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Bolsa deleted successfully',
      });
    });

    test('devuelve 400 si el servicio lanza un error', async () => {
      bolsaService.deleteBolsa.mockRejectedValue(new Error('delete error'));

      const req = { params: { bolsaId: '1' } };
      const res = mockResponse();

      await deleteBolsa(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'delete error',
      });
    });
  });
});
