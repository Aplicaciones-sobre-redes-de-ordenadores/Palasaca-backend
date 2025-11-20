const {
  getAccountsByUser,
    createAccount,
    getAccountById,
    updateAccount,
    deleteAccount,
} = require('../../../src/controllers/accountController');

jest.mock('../../../src/services/accountService', () => ({
  getAccountsByUser: jest.fn(),
  createAccount: jest.fn(),
  getAccountById: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn(),
}));

const accountService = require('../../../src/services/accountService');

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

describe('accountController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAccountsByUser devuelve las cuentas del Usuario', async () => {
    const fakeAccounts = [
        {
            toJSON: () => ({
                id_cuenta: 'acc1',
                id_usuario: 'user1',
                NombreCuenta: 'Cuenta 1',
                Dinero: 1000,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-02',
            }),
        },
        {
            toJSON: () => ({
                id_cuenta: 'acc2',
                id_usuario: 'user1',
                NombreCuenta: 'Cuenta 2',
                Dinero: 500,
                createdAt: '2024-02-01',
                updatedAt: '2024-02-02',
            }),
        },
    ];

    accountService.getAccountsByUser.mockResolvedValue(fakeAccounts);

    const req = {params: { userId: 'user1' }};
    const res = mockResponse();

    await getAccountsByUser(req, res);

    expect(accountService.getAccountsByUser).toHaveBeenCalledWith('user1');

    expect(res.json).toHaveBeenCalledWith({
        success: true,
        accounts: [
        {
            id_cuenta: 'acc1',
            id_usuario: 'user1',
            NombreCuenta: 'Cuenta 1',
            Dinero: 1000,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
        },
        {
            id_cuenta: 'acc2',
            id_usuario: 'user1',
            NombreCuenta: 'Cuenta 2',
            Dinero: 500,
            createdAt: '2024-02-01',
            updatedAt: '2024-02-02',
        },
        ],
    });
  });
  
  test('getAccountsByUser devuelve 400 si falta userId', async () => {
    const req = { params: {} };
    const res = mockResponse();

    await getAccountsByUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User ID is required',
    });
  });

  test('getAccountsByUser devuelve 500 si hay error', async () => {
    accountService.getAccountsByUser.mockRejectedValue(new Error('db error'));

    const req = { params: { userId: 'user1' } };
    const res = mockResponse();

    await getAccountsByUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, 
                                            error: 'db error' 
    });
  });

  test('createAccount crea la cuenta del Usuario', async () => {
    const fakeAccounts = {
            toJSON: () => ({
                id_cuenta: 'acc1',
                id_usuario: 'user1',
                NombreCuenta: 'Cuenta 1',
                Dinero: 1000,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-02',
            }),
        };

    accountService.createAccount.mockResolvedValue(fakeAccounts);

    const req = {body: { userId: 'user1' , accountName: 'Ahorro', initialBalance: 1500 }};
    const res = mockResponse();

    await createAccount(req, res);
    expect(accountService.createAccount).toHaveBeenCalledWith('user1', 'Ahorro', 1500);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Account created successfully",
        account: {
            id_cuenta: 'acc1',
            id_usuario: 'user1',
            NombreCuenta: 'Cuenta 1',
            Dinero: 1000,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
        },
    });
  });

  test('createAccount devuelve 400 si falta userId o accountName', async () => {
    const req = {body: { accountName: 'Ahorro' }};
    const res = mockResponse();

    await createAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "User ID and account name are required",
    });
  });

  test('createAccount devuelve 500 si hay error', async () => {
    accountService.createAccount.mockRejectedValue(new Error('db error'));

    const req = {body: { userId: 'user1' , accountName: 'Ahorro', initialBalance: 1500 }};
    const res = mockResponse();

    await createAccount(req, res);
    expect(accountService.createAccount).toHaveBeenCalledWith('user1', 'Ahorro', 1500);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, 
                                            error: 'db error' 
    });
  });

  test('getAccountById devuelve la cuenta del Usuario por accountId', async () => {
    const fakeAccounts = {
            toJSON: () => ({
                id_cuenta: 'acc1',
                id_usuario: 'user1',
                NombreCuenta: 'Cuenta 1',
                Dinero: 1000,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-02',
            }),
        };

    accountService.getAccountById.mockResolvedValue(fakeAccounts);

    const req = { params: { accountId: 'acc1' }};
    const res = mockResponse();

    await getAccountById(req, res);
    expect(accountService.getAccountById).toHaveBeenCalledWith( 'acc1' );

    expect(res.json).toHaveBeenCalledWith({
        success: true,
        account: {
            id_cuenta: 'acc1',
            id_usuario: 'user1',
            NombreCuenta: 'Cuenta 1',
            Dinero: 1000,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
        },
    });
  });

});