jest.mock('../../../src/config/parseConfig', () => {
  const mockFind = jest.fn();
  const mockFirst = jest.fn();
  const mockGet = jest.fn();
  const mockEqualTo = jest.fn();
  const mockInclude = jest.fn();
  const mockDescending = jest.fn();
  const mockSave = jest.fn();
  const mockSet = jest.fn();

  const Query = jest.fn().mockImplementation(() => ({
    equalTo: mockEqualTo,
    include: mockInclude,
    descending: mockDescending,
    find: mockFind,
    first: mockFirst,
    get: mockGet,
  }));

  function ParseObject(className) {
    this.className = className;
    this.set = mockSet;
    this.save = mockSave;
    this.id = undefined;
  }

  ParseObject.extend = jest.fn().mockReturnValue(ParseObject);

  return {
    Object: ParseObject,
    Query,
    __mocks: {
      mockFind,
      mockFirst,
      mockGet,
      mockEqualTo,
      mockInclude,
      mockDescending,
      mockSave,
      mockSet,
    },
  };
});

const Parse = require('../../../src/config/parseConfig');
const {
  mockFind,
  mockGet,
  mockSave,
} = Parse.__mocks;

const CryptoModel = require('../../../src/models/CryptoModel');
const cryptoService = require('../../../src/services/cryptoService');

describe('cryptoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAllCryptos devuelve array de CryptoModel', async () => {
    const fakeCrypto = {
      id: 'btc',
      get: (field) =>
        ({
          Simbolo: 'BTC',
          Precio: 50000,
          VariacionPrecio: 2.5,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        }[field]),
    };

    mockFind.mockResolvedValue([fakeCrypto]);

    const result = await cryptoService.getAllCryptos();

    expect(mockFind).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(CryptoModel);
  });

  test('createCrypto devuelve CryptoModel creado', async () => {
    const savedCrypto = {
      id: 'eth',
      get: (field) =>
        ({
          Simbolo: 'ETH',
          Precio: 3000,
          VariacionPrecio: -1.1,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-02'),
        }[field]),
    };

    mockSave.mockResolvedValue(savedCrypto);

    const result = await cryptoService.createCrypto({
      simbolo: 'ETH',
      precio: '3000',
      VariacionPrecio: '-1.1',
    });

    expect(mockSave).toHaveBeenCalled();
    expect(result).toBeInstanceOf(CryptoModel);
  });

  test('getCryptoById devuelve CryptoModel', async () => {
    const fakeCrypto = {
      id: 'doge',
      get: (field) =>
        ({
          Simbolo: 'DOGE',
          Precio: 0.1,
          VariacionPrecio: 10,
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-03-02'),
        }[field]),
    };

    mockGet.mockResolvedValue(fakeCrypto);

    const result = await cryptoService.getCryptoById('doge');

    expect(mockGet).toHaveBeenCalledWith('doge', { useMasterKey: true });
    expect(result).toBeInstanceOf(CryptoModel);
  });

  test('updateCrypto devuelve CryptoModel actualizado', async () => {
    const crypto = {
      set: jest.fn(),
      save: jest.fn(),
    };

    const savedCrypto = {
      id: 'xrp',
      get: (field) =>
        ({
          Simbolo: 'XRP',
          Precio: 0.5,
          VariacionPrecio: 0.2,
          createdAt: new Date('2024-04-01'),
          updatedAt: new Date('2024-04-02'),
        }[field]),
    };

    crypto.save.mockResolvedValue(savedCrypto);
    mockGet.mockResolvedValue(crypto);

    const result = await cryptoService.updateCrypto('xrp', {
      simbolo: 'XRP',
      precio: '0.5',
      VariacionPrecio: '0.2',
    });

    expect(crypto.set).toHaveBeenCalled();
    expect(result).toBeInstanceOf(CryptoModel);
  });

  test('deleteCrypto devuelve true al eliminar', async () => {
    const crypto = {
      destroy: jest.fn().mockResolvedValue(true),
    };

    mockGet.mockResolvedValue(crypto);

    const result = await cryptoService.deleteCrypto('xrp');

    expect(mockGet).toHaveBeenCalledWith('xrp', { useMasterKey: true });
    expect(crypto.destroy).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
