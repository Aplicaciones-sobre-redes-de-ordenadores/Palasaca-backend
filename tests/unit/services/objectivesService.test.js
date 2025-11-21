// Mock de Parse (igual estilo que en el resto de services)
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

  // Para cosas tipo Parse.Object.extend("Objetivos")
  ParseObject.extend = jest.fn().mockReturnValue(ParseObject);

  // Mock muy básico de File por si se usa en createObjetivo
  const File = jest.fn().mockImplementation((name, data) => ({
    name,
    data,
    save: jest.fn().mockResolvedValue(true),
  }));

  return {
    Object: ParseObject,
    Query,
    File,
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

// ⚠️ Aquí mockeamos el modelo para evitar "not a constructor"
jest.mock('../../../src/models/ObjectiveModel.js', () => {
  // Constructor falso que devuelve un objeto "marcado"
  return jest.fn().mockImplementation(() => ({
    _isObjetivoModel: true,
  }));
});

const Parse = require('../../../src/config/parseConfig');
const {
  mockFind,
  mockGet,
  mockSave,
  mockSet,
} = Parse.__mocks;

const ObjetivoModel = require('../../../src/models/ObjectiveModel.js');
const objectivesService = require('../../../src/services/objectivesService');

describe('objectivesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getObjetivosByAccount devuelve array de ObjetivoModel (mockeado)', async () => {
    const createdAt = new Date('2024-01-01');
    const updatedAt = new Date('2024-02-01');

    const fakeObjective = {
      id: 'obj1',
      get: (field) =>
        ({
          id_cuenta: { id: 'acc1' },
          Descripcion: 'Viaje',
          PorcentajeAhorro: 20,
          Cantidad_Objetivo: 1000,
          Cantidad_Actual: 200,
          Fecha_Inicio: new Date('2024-01-01'),
          Fecha_Fin: new Date('2024-12-31'),
          imagenObjetivo: { url: () => 'http://imagen.test/viaje.png' },
          createdAt,
          updatedAt,
        }[field]),
      createdAt,
      updatedAt,
    };

    mockFind.mockResolvedValue([fakeObjective]);

    const result = await objectivesService.getObjetivosByAccount('acc1');

    expect(mockFind).toHaveBeenCalled();
    expect(ObjetivoModel).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    // Lo que devuelve nuestro mock de constructor
    expect(result[0]._isObjetivoModel).toBe(true);
  });

  test('createObjetivo devuelve ObjetivoModel (mockeado)', async () => {
    const createdAt = new Date('2024-03-01');
    const updatedAt = new Date('2024-03-02');

    const savedObjective = {
      id: 'obj2',
      get: (field) =>
        ({
          id_cuenta: { id: 'acc1' },
          Descripcion: 'Coche',
          PorcentajeAhorro: 15,
          Cantidad_Objetivo: 5000,
          Cantidad_Actual: 750,
          Fecha_Inicio: new Date('2024-03-01'),
          Fecha_Fin: new Date('2025-03-01'),
          imagenObjetivo: { url: () => 'http://imagen.test/coche.png' },
          createdAt,
          updatedAt,
        }[field]),
      createdAt,
      updatedAt,
    };

    mockSave.mockResolvedValue(savedObjective);

    const result = await objectivesService.createObjetivo('acc1', {
      Descripcion: 'Coche',
      PorcentajeAhorro: '15',
      Cantidad_Objetivo: '5000',
      Cantidad_Actual: '750',
      Fecha_Inicio: '2024-03-01',
      Fecha_Fin: '2025-03-01',
      imagenObjetivo: {
        name: 'coche.png',
        base64: 'FAKEBASE64',
      },
    });

    expect(mockSave).toHaveBeenCalled();
    expect(ObjetivoModel).toHaveBeenCalledTimes(1);
    expect(result._isObjetivoModel).toBe(true);
  });

    test('updateObjetivoProgress actualiza la cantidad y devuelve el objetivo', async () => {
    const objetivo = {
        set: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
    };

    mockGet.mockResolvedValue(objetivo);

    const result = await objectivesService.updateObjetivoProgress(
        'obj1',
        '50.5',
    );

    expect(mockGet).toHaveBeenCalledWith('obj1', { useMasterKey: true });
    // 👇 el service establece directamente la nueva cantidad (50.5), no la suma
    expect(objetivo.set).toHaveBeenCalledWith('Cantidad_Actual', 50.5);
    expect(objetivo.save).toHaveBeenCalled();
    expect(result).toBe(objetivo);
    });
});
