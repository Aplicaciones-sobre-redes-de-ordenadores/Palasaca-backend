// Mismo mock en todos los tests de services
jest.mock('../../../src/config/parseConfig', ()  => {
  const mockFind = jest.fn();
  const mockFirst = jest.fn();
  const mockEqualTo = jest.fn();
  const mockInclude = jest.fn();
  const mockDescending = jest.fn();
  const mockAscending = jest.fn();
  const mockSave = jest.fn();
  const mockSet = jest.fn();

  const Query = jest.fn().mockImplementation(() => ({
    equalTo: mockEqualTo,
    include: mockInclude,
    descending: mockDescending,
    ascending: mockAscending, // 👈 añadido
    find: mockFind,
    first: mockFirst,
  }));

  function ParseObject(className) {
    this.className = className;
    this.set = mockSet;
    this.save = mockSave;
    this.id = undefined;
  }

  // Para cosas tipo Parse.Object.extend("Cuentas")
  ParseObject.extend = jest.fn().mockReturnValue(ParseObject);

  return {
    Object: ParseObject,
    Query,
    __mocks: {
      mockFind,
      mockFirst,
      mockEqualTo,
      mockInclude,
      mockDescending,
      mockAscending,
      mockSave,
      mockSet,
    },
  };
});

// 1) Mock de Parse (mismo bloque que antes)

const Parse = require('../../../src/config/parseConfig');
const {
  mockFind,
  mockSave,
} = Parse.__mocks;

const AccountModel = require('../../../src/models/AccountModel');
const accountService = require('../../../src/services/accountService');

describe('accountService', () => {
  beforeEach(() => {
    mockFind.mockReset();
    mockSave.mockReset();
  });

  test('getAccountsByUser devuelve array de AccountModel', async () => {
    const fakeAccount = {
      id: 'acc1',
      get: (field) =>
        ({
          id_usuario: { id: 'user1' },
          NombreCuenta: 'Cuenta Corriente',
          Dinero: 1000,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-02-01'),
        }[field]),
    };

    mockFind.mockResolvedValue([fakeAccount]);

    const result = await accountService.getAccountsByUser('user1');

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(AccountModel);
    expect(result[0]).toMatchObject({
      id_cuenta: 'acc1',
      NombreCuenta: 'Cuenta Corriente',
      Dinero: 1000,
    });
  });

  test('createAccount devuelve AccountModel con los datos creados', async () => {
    const savedAccount = {
      id: 'acc2',
      get: (field) =>
        ({
          id_usuario: { id: 'user1' },
          NombreCuenta: 'Nueva Cuenta',
          Dinero: 50,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        }[field]),
    };

    mockSave.mockResolvedValue(savedAccount);

    const result = await accountService.createAccount(
      'user1',
      'Nueva Cuenta',
      50,
    );

    expect(result).toBeInstanceOf(AccountModel);
    expect(result).toMatchObject({
      id_cuenta: 'acc2',
      NombreCuenta: 'Nueva Cuenta',
      Dinero: 50,
    });
  });
});
