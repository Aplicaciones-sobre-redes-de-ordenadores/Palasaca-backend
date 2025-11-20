// Mismo mock en todos los tests de services
jest.mock('../../../src/config/parseConfig', () => {
  const mockFind = jest.fn();
  const mockFirst = jest.fn();
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
      mockSave,
      mockSet,
    },
  };
});
// 1) Mock de Parse (pega aquí el bloque de jest.mock('../../src/config/parseConfig', ...) de arriba)

// 2) Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(async (password) => `hashed-${password}`),
  compare: jest.fn(async () => true),
}));

const Parse = require('../../../src/config/parseConfig');
const {
  mockFind,
  mockFirst,
  mockEqualTo,
  mockInclude,
  mockDescending,
  mockSave,
  mockSet,
} = Parse.__mocks;

const UserModel = require('../../../src/models/userModel');
const userService = require('../../../src/services/userService');

describe('userService', () => {
  beforeEach(() => {
    // Resetear todos los mocks antes de cada test
    mockFind.mockReset();
    mockFirst.mockReset();
    mockEqualTo.mockReset();
    mockInclude.mockReset();
    mockDescending.mockReset();
    mockSave.mockReset();
    mockSet.mockReset();
  });

  test('getAllUsers devuelve una lista de UserModel', async () => {
    const fakeUser = {
      get: (field) =>
        ({ Nombre: 'Pepe', Correo: 'pepe@test.com' }[field]),
    };

    mockFind.mockResolvedValue([fakeUser]);

    const result = await userService.getAllUsers();

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(UserModel);
    expect(result[0]).toMatchObject({
      name: 'Pepe',
      email: 'pepe@test.com',
    });
  });

  test('addUser crea usuario cuando no existe previamente', async () => {
    // getUserByEmailFromDB -> usa Query.first() internamente
    mockFirst.mockResolvedValue(null); // no existe el usuario

    // Simulamos que save() en Parse devuelve el objeto guardado
    mockSave.mockResolvedValue({
      get: (field) =>
        ({ Nombre: 'Ana', Correo: 'ana@test.com' }[field]),
    });

    const result = await userService.addUser({
      name: 'Ana',
      email: 'ana@test.com',
      password: '1234',
    });

    expect(result).toBeInstanceOf(UserModel);
    expect(result).toMatchObject({
      name: 'Ana',
      email: 'ana@test.com',
    });
  });

  test('addUser lanza error si el email ya existe', async () => {
    mockFirst.mockResolvedValue({ id: 'existing-user' }); // hay usuario

    await expect(
      userService.addUser({
        name: 'Ana',
        email: 'ana@test.com',
        password: '1234',
      }),
    ).rejects.toThrow('User already exists');
  });

  test('findUserByEmail delega en la BBDD y devuelve UserModel o null', async () => {
    // Caso 1: encontrado
    const fakeUser = {
      get: (field) =>
        ({ Nombre: 'Luis', Correo: 'luis@test.com' }[field]),
    };
    mockFirst.mockResolvedValueOnce(fakeUser);

    const found = await userService.findUserByEmail('luis@test.com');
    expect(found).toBeInstanceOf(UserModel);
    expect(found).toMatchObject({
      name: 'Luis',
      email: 'luis@test.com',
    });

    // Caso 2: no encontrado
    mockFirst.mockResolvedValueOnce(null);
    const notFound = await userService.findUserByEmail('no@existe.com');
    expect(notFound).toBeNull();
  });
});
