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

const MovementModel = require('../../../src/models/MovementModel.js');
const movementService = require('../../../src/services/movementService');

describe('movementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getMovementsByAccount devuelve array de MovementModel', async () => {
    const fakeMovement = {
      id: 'mov1',
      get: (field) =>
        ({
          id_cuenta: { id: 'acc1' },
          Tipo: 'gasto',
          Fijo: true,
          Categoria: 'Comida',
          Comentarios: 'Cena',
          Cantidad: 25,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        }[field]),
    };

    mockFind.mockResolvedValue([fakeMovement]);

    const result = await movementService.getMovementsByAccount('acc1');

    expect(mockFind).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(MovementModel);
  });

  test('createMovement devuelve MovementModel creado', async () => {
    const savedMovement = {
      id: 'mov2',
      get: (field) =>
        ({
          id_cuenta: { id: 'acc1' },
          Tipo: 'ingreso',
          Fijo: false,
          Categoria: 'Nómina',
          Comentarios: 'Salario',
          Cantidad: 1000,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-02'),
        }[field]),
    };

    mockSave.mockResolvedValue(savedMovement);

    const result = await movementService.createMovement('acc1', {
      Tipo: 'ingreso',
      Cantidad: '1000',
      Fijo: false,
      Categoria: 'Nómina',
      Comentarios: 'Salario',
    });

    expect(mockSave).toHaveBeenCalled();
    expect(result).toBeInstanceOf(MovementModel);
  });

  test('updateAccountBalance suma correctamente el saldo', async () => {
    const account = {
      get: jest.fn(() => 500),
      set: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };

    mockGet.mockResolvedValue(account);

    const newBalance = await movementService.updateAccountBalance(
      'acc1',
      200,
    );

    expect(mockGet).toHaveBeenCalledWith('acc1', { useMasterKey: true });
    expect(account.set).toHaveBeenCalledWith('Dinero', 700);
    expect(account.save).toHaveBeenCalled();
    expect(newBalance).toBe(700);
  });
});
