// tests/unit/middleware/authMiddleware.test.js

const { authMiddleware } = require('../../../src/middlewares/authMiddleware'); // ajusta la ruta

jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devuelve 401 si no se proporciona ningún token', () => {
    const req = { headers: {} };
    const res = mockResponse();
    const next = jest.fn();

    const middleware = authMiddleware(); // sin requiredRole
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('devuelve 401 si el token es inválido (jwt.verify lanza error)', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalidtoken',
      },
    };
    const res = mockResponse();
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const middleware = authMiddleware();
    middleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      'invalidtoken',
      process.env.JWT_SECRET
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('permite el paso si el token es válido y no se requiere rol concreto', () => {
    const req = {
      headers: {
        authorization: 'Bearer validtoken',
      },
    };
    const res = mockResponse();
    const next = jest.fn();

    jwt.verify.mockReturnValue({ userId: 'u1', role: 'user' });

    const middleware = authMiddleware(); // sin requiredRole
    middleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      'validtoken',
      process.env.JWT_SECRET
    );
    expect(req.userId).toBe('u1');
    expect(req.userRole).toBe('user');
    expect(next).toHaveBeenCalled();
  });

  test('permite el paso si el token es válido y el rol coincide con requiredRole', () => {
    const req = {
      headers: {
        authorization: 'Bearer admintoken',
      },
    };
    const res = mockResponse();
    const next = jest.fn();

    jwt.verify.mockReturnValue({ userId: 'u2', role: 'admin' });

    const middleware = authMiddleware('admin');
    middleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      'admintoken',
      process.env.JWT_SECRET
    );
    expect(req.userId).toBe('u2');
    expect(req.userRole).toBe('admin');
    expect(next).toHaveBeenCalled();
  });

  test('devuelve 403 si el rol del token no coincide con requiredRole', () => {
    const req = {
      headers: {
        authorization: 'Bearer usertoken',
      },
    };
    const res = mockResponse();
    const next = jest.fn();

    jwt.verify.mockReturnValue({ userId: 'u3', role: 'user' });

    const middleware = authMiddleware('admin');
    middleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      'usertoken',
      process.env.JWT_SECRET
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No autorizado',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
