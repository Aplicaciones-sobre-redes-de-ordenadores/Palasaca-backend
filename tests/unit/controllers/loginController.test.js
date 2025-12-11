// tests/unit/controllers/loginController.test.js

// Mockeamos primero los servicios que usa el controller
jest.mock('../../../src/services/userService', () => ({
  getUserObjectId: jest.fn(),
}));

jest.mock('../../../src/services/logService', () => ({
  saveLog: jest.fn().mockResolvedValue(undefined),
}));

const { loginUserController } = require('../../../src/controllers/loginController');
const userService = require('../../../src/services/userService');
const { saveLog } = require('../../../src/services/logService');

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devuelve success y user si las credenciales son correctas', async () => {
    // El servicio real devuelve { id, esAdmin } :contentReference[oaicite:0]{index=0}
    userService.getUserObjectId.mockResolvedValue({
      id: 'abc123',
      esAdmin: false, // o true, da igual para este test
    });

    const req = {
      method: 'POST',
      originalUrl: '/login',
      body: { email: 'test@test.com', password: '1234' },
    };
    const res = mockResponse();

    await loginUserController(req, res);

    expect(userService.getUserObjectId).toHaveBeenCalledWith(
      'test@test.com',
      '1234'
    );

    // Se llama a saveLog con la acción y el objectId calculado :contentReference[oaicite:1]{index=1}
    expect(saveLog).toHaveBeenCalledWith('POST /login', 'abc123');

    // El controller devuelve success + user con objectId, email y esAdmin :contentReference[oaicite:2]{index=2}
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: { objectId: 'abc123', email: 'test@test.com', esAdmin: false },
    });
  });

  test('devuelve 401 si las credenciales son incorrectas', async () => {
    userService.getUserObjectId.mockResolvedValue(null);

    const req = {
      method: 'POST',
      originalUrl: '/login',
      body: { email: 'wrong@test.com', password: 'bad' },
    };
    const res = mockResponse();

    await loginUserController(req, res);

    expect(userService.getUserObjectId).toHaveBeenCalledWith(
      'wrong@test.com',
      'bad'
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid email or password',
    });

    // No debería guardar log si el login falla
    expect(saveLog).not.toHaveBeenCalled();
  });

  test('devuelve 500 si el servicio lanza un error', async () => {
    userService.getUserObjectId.mockRejectedValue(
      new Error('algo ha ido mal')
    );

    const req = {
      method: 'POST',
      originalUrl: '/login',
      body: { email: 'test@test.com', password: '1234' },
    };
    const res = mockResponse();

    await loginUserController(req, res);

    expect(userService.getUserObjectId).toHaveBeenCalledWith(
      'test@test.com',
      '1234'
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'algo ha ido mal',
    });
  });
});
