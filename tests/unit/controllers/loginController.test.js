// tests/loginController.test.js
const { loginUserController } = require('../../../src/controllers/loginController');
const userService = require('../../../src/services/userService');

jest.mock('../../../src/services/userService');

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

describe('loginUserController', () => {
  test('devuelve success y user si las credenciales son correctas', async () => {
    userService.getUserObjectId = jest.fn().mockResolvedValue('abc123');

    const req = { body: { email: 'test@test.com', password: '1234' } };
    const res = mockResponse();

    await loginUserController(req, res);

    expect(userService.getUserObjectId)
      .toHaveBeenCalledWith('test@test.com', '1234');

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: { objectId: 'abc123', email: 'test@test.com', esAdmin: undefined },
    });
  });

  test('devuelve 401 si las credenciales son incorrectas', async () => {
    userService.getUserObjectId = jest.fn().mockResolvedValue(null);

    const req = { body: { email: 'wrong@test.com', password: 'bad' } };
    const res = mockResponse();

    await loginUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid email or password',
    });
  });

  test('devuelve 500 si el servicio lanza un error', async () => {
    userService.getUserObjectId = jest
      .fn()
      .mockRejectedValue(new Error('algo ha ido mal'));

    const req = { body: { email: 'test@test.com', password: '1234' } };
    const res = mockResponse();

    await loginUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'algo ha ido mal',
    });
  });
});
