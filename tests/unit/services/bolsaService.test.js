// Mismo estilo de mock que en los otros services, pero añadiendo "get"
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

const BolsaModel = require('../../../src/models/BolsaModel');
const bolsaService = require('../../../src/services/bolsaService');

describe('bolsaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAllBolsas devuelve array de BolsaModel', async () => {
    const fakeBolsa = {
      id: 'bolsa1',
      get: (field) =>
        ({
          Codigo: 'ABC',
          Empresa: 'Empresa SA',
          Nombre: 'Empresa ABC',
          URLImagen: 'http://imagen.test/logo.png',
          Precio: 10.5,
          VariacionPrecioDiario: 1.2,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        }[field]),
    };

    mockFind.mockResolvedValue([fakeBolsa]);

    const result = await bolsaService.getAllBolsas();

    expect(mockFind).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(BolsaModel);
  });

  test('createBolsa devuelve BolsaModel creado', async () => {
    const savedBolsa = {
      id: 'bolsa2',
      get: (field) =>
        ({
          Codigo: 'XYZ',
          Empresa: 'Empresa XYZ',
          Nombre: 'XYZ Corp',
          URLImagen: 'http://imagen.test/xyz.png',
          Precio: 20.5,
          VariacionPrecioDiario: 0.5,
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-03-02'),
        }[field]),
    };

    mockSave.mockResolvedValue(savedBolsa);

    const result = await bolsaService.createBolsa({
      codigo: 'XYZ',
      empresa: 'Empresa XYZ',
      nombre: 'XYZ Corp',
      url_imagen: 'http://imagen.test/xyz.png',
      precio: '20.5',
      VariacionPrecioDiario: '0.5',
    });

    expect(mockSave).toHaveBeenCalled();
    expect(result).toBeInstanceOf(BolsaModel);
  });

  test('getBolsaById devuelve BolsaModel', async () => {
    const fakeBolsa = {
      id: 'bolsa3',
      get: (field) =>
        ({
          Codigo: 'DEF',
          Empresa: 'Empresa DEF',
          Nombre: 'DEF Corp',
          URLImagen: 'http://imagen.test/def.png',
          Precio: 30,
          VariacionPrecioDiario: -0.3,
          createdAt: new Date('2024-04-01'),
          updatedAt: new Date('2024-04-02'),
        }[field]),
    };

    mockGet.mockResolvedValue(fakeBolsa);

    const result = await bolsaService.getBolsaById('bolsa3');

    expect(mockGet).toHaveBeenCalledWith('bolsa3', { useMasterKey: true });
    expect(result).toBeInstanceOf(BolsaModel);
  });

  test('updateBolsa devuelve BolsaModel actualizado', async () => {
    const bolsa = {
      set: jest.fn(),
      save: jest.fn(),
    };

    const savedBolsa = {
      id: 'bolsa4',
      get: (field) =>
        ({
          Codigo: 'UPD',
          Empresa: 'Empresa UPD',
          Nombre: 'UPD Corp',
          URLImagen: 'http://imagen.test/upd.png',
          Precio: 99.9,
          VariacionPrecioDiario: 2.5,
          createdAt: new Date('2024-05-01'),
          updatedAt: new Date('2024-05-02'),
        }[field]),
    };

    bolsa.save.mockResolvedValue(savedBolsa);
    mockGet.mockResolvedValue(bolsa);

    const result = await bolsaService.updateBolsa('bolsa4', {
      codigo: 'UPD',
      empresa: 'Empresa UPD',
      nombre: 'UPD Corp',
      url_imagen: 'http://imagen.test/upd.png',
      precio: '99.9',
      VariacionPrecioDiario: '2.5',
    });

    expect(bolsa.set).toHaveBeenCalled();
    expect(result).toBeInstanceOf(BolsaModel);
  });

  test('deleteBolsa elimina una empresa y devuelve true', async () => {
    const bolsa = {
      destroy: jest.fn().mockResolvedValue(true),
    };

    mockGet.mockResolvedValue(bolsa);

    const result = await bolsaService.deleteBolsa('bolsa5');

    expect(mockGet).toHaveBeenCalledWith('bolsa5', { useMasterKey: true });
    expect(bolsa.destroy).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
