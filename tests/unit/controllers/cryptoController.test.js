// tests/unit/controllers/cryptoController.test.js

const {
  getAllCryptos,
  createCrypto,
  getCrypto,
  updateCrypto,
  deleteCrypto,
} = require('../../../src/controllers/cryptoController');

jest.mock('../../../src/services/cryptoService', () => ({
  getAllCryptos: jest.fn(),
  createCrypto: jest.fn(),
  getCryptoById: jest.fn(),
  updateCrypto: jest.fn(),
  deleteCrypto: jest.fn(),
}));

const cryptoService = require('../../../src/services/cryptoService');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('cryptoController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /cryptos
  describe('getAllCryptos', () => {
    test('devuelve lista de cryptos con success true', async () => {
      const fakeCryptos = [
        {
          toJSON: () => ({
            id: '1',
            simbolo: 'BTC',
            precio: 50000,
            variacionPrecio: 2.5,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
          }),
        },
        {
          toJSON: () => ({
            id: '2',
            simbolo: 'ETH',
            precio: 3000,
            variacionPrecio: -1.2,
            createdAt: '2024-02-01',
            updatedAt: '2024-02-02',
          }),
        },
      ];

      cryptoService.getAllCryptos.mockResolvedValue(fakeCryptos);

      const req = {};
      const res = mockResponse();

      await getAllCryptos(req, res);

      expect(cryptoService.getAllCryptos).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        cryptos: [
          {
            id: '1',
            simbolo: 'BTC',
            precio: 50000,
            variacionPrecio: 2.5,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
          },
          {
            id: '2',
            simbolo: 'ETH',
            precio: 3000,
            variacionPrecio: -1.2,
            createdAt: '2024-02-01',
            updatedAt: '2024-02-02',
          },
        ],
      });
    });

    test('devuelve 500 si el servicio lanza un error', async () => {
      cryptoService.getAllCryptos.mockRejectedValue(new Error('db error'));

      const req = {};
      const res = mockResponse();

      await getAllCryptos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'db error',
      });
    });
  });

  // POST /cryptos
  describe('createCrypto', () => {
    test('devuelve 201 y la crypto creada si todo va bien', async () => {
      const body = {
        simbolo: 'BTC',
        precio: 50000,
        VariacionPrecioDiario: 2.5,
      };

      const fakeCrypto = {
        toJSON: () => ({
          id: '1',
          simbolo: 'BTC',
          precio: 50000,
          variacionPrecio: 2.5,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        }),
      };

      cryptoService.createCrypto.mockResolvedValue(fakeCrypto);

      const req = { body };
      const res = mockResponse();

      await createCrypto(req, res);

      expect(cryptoService.createCrypto).toHaveBeenCalledWith(body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        crypto: {
          id: '1',
          simbolo: 'BTC',
          precio: 50000,
          variacionPrecio: 2.5,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
      });
    });

    test('devuelve 400 si el servicio lanza un error', async () => {
      cryptoService.createCrypto.mockRejectedValue(new Error('create error'));

      const req = {
        body: {
          simbolo: 'BTC',
          precio: 50000,
        },
      };
      const res = mockResponse();

      await createCrypto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'create error',
      });
    });
  });

  // GET /cryptos/:cryptoId
  describe('getCrypto', () => {
    test('devuelve 200 y la crypto si existe', async () => {
      const fakeCrypto = {
        toJSON: () => ({
          id: '1',
          simbolo: 'BTC',
          precio: 50000,
          variacionPrecio: 2.5,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        }),
      };

      cryptoService.getCryptoById.mockResolvedValue(fakeCrypto);

      const req = { params: { cryptoId: '1' } };
      const res = mockResponse();

      await getCrypto(req, res);

      expect(cryptoService.getCryptoById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        crypto: {
          id: '1',
          simbolo: 'BTC',
          precio: 50000,
          variacionPrecio: 2.5,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
      });
    });

    test('devuelve 404 si el servicio lanza un error (no encontrada)', async () => {
      cryptoService.getCryptoById.mockRejectedValue(new Error('Not found'));

      const req = { params: { cryptoId: '1' } };
      const res = mockResponse();

      await getCrypto(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not found',
      });
    });
  });

  // PUT /cryptos/:cryptoId
  describe('updateCrypto', () => {
    test('devuelve 200 y la crypto actualizada si todo va bien', async () => {
      const updates = {
        simbolo: 'BTC',
        precio: 55000,
      };

      const fakeCrypto = {
        toJSON: () => ({
          id: '1',
          simbolo: 'BTC',
          precio: 55000,
          variacionPrecio: 3.1,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-03',
        }),
      };

      cryptoService.updateCrypto.mockResolvedValue(fakeCrypto);

      const req = { params: { cryptoId: '1' }, body: updates };
      const res = mockResponse();

      await updateCrypto(req, res);

      expect(cryptoService.updateCrypto).toHaveBeenCalledWith('1', updates);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        crypto: {
          id: '1',
          simbolo: 'BTC',
          precio: 55000,
          variacionPrecio: 3.1,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-03',
        },
      });
    });

    test('devuelve 400 si el servicio lanza un error', async () => {
      cryptoService.updateCrypto.mockRejectedValue(new Error('update error'));

      const req = {
        params: { cryptoId: '1' },
        body: { precio: 55000 },
      };
      const res = mockResponse();

      await updateCrypto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'update error',
      });
    });
  });

  // DELETE /cryptos/:cryptoId
  describe('deleteCrypto', () => {
    test('devuelve success true y mensaje si se elimina correctamente', async () => {
      cryptoService.deleteCrypto.mockResolvedValue(true);

      const req = { params: { cryptoId: '1' } };
      const res = mockResponse();

      await deleteCrypto(req, res);

      expect(cryptoService.deleteCrypto).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Crypto deleted successfully',
      });
    });

    test('devuelve 400 si el servicio lanza un error', async () => {
      cryptoService.deleteCrypto.mockRejectedValue(new Error('delete error'));

      const req = { params: { cryptoId: '1' } };
      const res = mockResponse();

      await deleteCrypto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'delete error',
      });
    });
  });
});
