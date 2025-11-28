const {
  getUsers,
  createUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  getUserID,
} = require('../../../src/controllers/userController');

jest.mock('../../../src/services/userService', () => ({
  getAllUsers: jest.fn(),
  addUser: jest.fn(),
  findUserByEmail: jest.fn(),
  updateUserName: jest.fn(),
  updateUserPassword: jest.fn(),
  deleteUser: jest.fn(),
  getUserObjectId: jest.fn(),
}));

const userService = require('../../../src/services/userService');

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

describe('userController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUsers devuelve lista de usuarios', async () => {
    const users = [
      { toJSON: () => ({ name: 'User1', email: 'u1@test.com' }) },
      { toJSON: () => ({ name: 'User2', email: 'u2@test.com' }) },
    ];
    userService.getAllUsers.mockResolvedValue(users);

    const req = {};
    const res = mockResponse();

    await getUsers(req, res);

    expect(userService.getAllUsers).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([
      { name: 'User1', email: 'u1@test.com' },
      { name: 'User2', email: 'u2@test.com' },
    ]);
  });

  test('getUsers devuelve 500 si hay error', async () => {
    userService.getAllUsers.mockRejectedValue(new Error('db error'));

    const req = {};
    const res = mockResponse();

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'db error' });
  });

  test('createUser éxito', async () => {
    const fakeUser = { toJSON: () => ({ name: 'Nuevo', email: 'nuevo@test.com' }) };
    userService.addUser.mockResolvedValue(fakeUser);

    const req = { body: { name: 'Nuevo', email: 'nuevo@test.com', password: '1234' } };
    const res = mockResponse();

    await createUser(req, res);

    expect(userService.addUser).toHaveBeenCalledWith({
      name: 'Nuevo',
      email: 'nuevo@test.com',
      password: '1234',
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'User created successfully',
      user: { name: 'Nuevo', email: 'nuevo@test.com' },
    });
  });

  test('createUser usuario duplicado', async () => {
    userService.addUser.mockRejectedValue(new Error('User already exists'));

    const req = { body: { name: 'Nuevo', email: 'nuevo@test.com', password: '1234' } };
    const res = mockResponse();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'User already exists with the given email',
    });
  });

  test('createUser otro error', async () => {
    userService.addUser.mockRejectedValue(new Error('otro error'));

    const req = { body: { name: 'Nuevo', email: 'nuevo@test.com', password: '1234' } };
    const res = mockResponse();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'otro error',
    });
  });

  test('getUserByEmail devuelve usuario si existe', async () => {
    const user = { toJSON: () => ({ name: 'U', email: 'u@test.com' }) };
    userService.findUserByEmail.mockResolvedValue(user);

    const req = { params: { email: 'u@test.com' } };
    const res = mockResponse();

    await getUserByEmail(req, res);

    expect(userService.findUserByEmail).toHaveBeenCalledWith('u@test.com');
    expect(res.json).toHaveBeenCalledWith({ name: 'U', email: 'u@test.com' });
  });

  test('getUserByEmail devuelve 404 si no existe', async () => {
    userService.findUserByEmail.mockResolvedValue(null);

    const req = { params: { email: 'no@test.com' } };
    const res = mockResponse();

    await getUserByEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  test('updateUser actualiza nombre y contraseña', async () => {
    const updated = { toJSON: () => ({ name: 'NuevoNombre' }) };
    userService.updateUserName.mockResolvedValue(updated);
    userService.updateUserPassword.mockResolvedValue(updated);

    const req = {
      params: { id: 'userId' },
      body: { name: 'NuevoNombre', checkPassword: 'old', newPassword: 'new' },
    };
    const res = mockResponse();

    await updateUser(req, res);

    expect(userService.updateUserName).toHaveBeenCalledWith('userId', 'NuevoNombre');
    expect(userService.updateUserPassword)
      .toHaveBeenCalledWith('userId', 'old', 'new');

    expect(res.json).toHaveBeenCalledWith({ name: 'NuevoNombre' });
  });

  test('deleteUser elimina usuario', async () => {
    userService.deleteUser.mockResolvedValue(true);

    const req = { params: { id: 'userId' } };
    const res = mockResponse();

    await deleteUser(req, res);

    expect(userService.deleteUser).toHaveBeenCalledWith('userId');
    expect(res.json).toHaveBeenCalledWith({ message: 'User deleted' });
  });

  test('getUserID devuelve objectId si credenciales son correctas', async () => {
    userService.getUserObjectId.mockResolvedValue('abc123');

    const req = { body: { email: 'u@test.com', password: '1234' } };
    const res = mockResponse();

    await getUserID(req, res);

    expect(userService.getUserObjectId)
      .toHaveBeenCalledWith('u@test.com', '1234');
    expect(res.json).toHaveBeenCalledWith({ objectId: 'abc123' });
  });

  test('getUserID devuelve 404 si credenciales incorrectas', async () => {
    userService.getUserObjectId.mockResolvedValue(null);

    const req = { body: { email: 'u@test.com', password: 'bad' } };
    const res = mockResponse();

    await getUserID(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid email or password',
    });
  });
});
