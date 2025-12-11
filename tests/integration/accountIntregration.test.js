// tests/integration/accountIntregration.test.js

const request = require('supertest');
const Parse = require('../../src/config/parseConfig'); // mismo Parse que usa el backend
const app = require('../../src/app');                  // Express app sin listen()

jest.setTimeout(30000);

describe('Integración: /accounts', () => {
  let testUserId;
  const createdAccountIds = [];
  let mainAccountId; // cuenta principal para probar GET/PUT/DELETE

  // Crear usuario de pruebas en Parse antes de todos los tests
  beforeAll(async () => {
    const Usuarios = Parse.Object.extend('Usuarios');
    const user = new Usuarios();

    user.set('Nombre', 'Usuario Integración Test');
    user.set('Correo', `int_test_${Date.now()}@palasaca.test`);

    const savedUser = await user.save(null, { useMasterKey: true });
    testUserId = savedUser.id;
    console.log('✅ Usuario de test creado con id =', testUserId);
  });

  // Limpiar cuentas y usuario al final
  afterAll(async () => {
    try {
      if (createdAccountIds.length > 0) {
        const Cuentas = Parse.Object.extend('Cuentas');
        const query = new Parse.Query(Cuentas);
        query.containedIn('objectId', createdAccountIds);
        const accounts = await query.find({ useMasterKey: true });
        await Parse.Object.destroyAll(accounts, { useMasterKey: true });
      }

      if (testUserId) {
        const Usuarios = Parse.Object.extend('Usuarios');
        const queryUser = new Parse.Query(Usuarios);
        const user = await queryUser.get(testUserId, { useMasterKey: true });
        await user.destroy({ useMasterKey: true });
      }
    } catch (err) {
      console.error('⚠️ Error limpiando datos de test en afterAll:', err);
    }
  });

  // --- 1) GET /accounts/user/:userId sin cuentas -> [] ---
  test('GET /accounts/user/:userId devuelve lista vacía si el usuario no tiene cuentas', async () => {
    const res = await request(app).get(`/accounts/user/${testUserId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.accounts)).toBe(true);
    expect(res.body.accounts.length).toBe(0);
  });

  // --- 2) POST /accounts crea una cuenta correctamente ---
  test('POST /accounts crea una cuenta para un usuario', async () => {
    const accountName = `INT_TEST_ACC_${Date.now()}`;
    const initialBalance = 123.45;

    const res = await request(app)
      .post('/accounts')
      .send({
        userId: testUserId,
        accountName,
        initialBalance,
      });

    // Solo logueamos si realmente falla (para depurar)
    if (res.statusCode !== 201) {
      console.error('❌ createRes status/body:', res.statusCode, res.body);
    }

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('account');

    const account = res.body.account;
    mainAccountId = account.id_cuenta;
    createdAccountIds.push(account.id_cuenta);

    expect(account.id_usuario).toBe(testUserId);
    expect(account.NombreCuenta).toBe(accountName);
    expect(account.Dinero).toBe(initialBalance);
  });

  // --- 3) GET /accounts/:accountId obtiene la cuenta por ID ---
  test('GET /accounts/:accountId devuelve la cuenta creada', async () => {
    const res = await request(app).get(`/accounts/${mainAccountId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('account');

    const account = res.body.account;
    expect(account.id_cuenta).toBe(mainAccountId);
    expect(account.id_usuario).toBe(testUserId);
  });

  // --- 4) GET /accounts/user/:userId ahora devuelve la cuenta en el listado ---
  test('GET /accounts/user/:userId incluye la cuenta recién creada', async () => {
    const res = await request(app).get(`/accounts/user/${testUserId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.accounts)).toBe(true);

    const accounts = res.body.accounts;
    const found = accounts.find(acc => acc.id_cuenta === mainAccountId);

    expect(found).toBeDefined();
    expect(found.id_usuario).toBe(testUserId);
  });

  // --- 5) PUT /accounts/:accountId actualiza NombreCuenta y Dinero ---
  test('PUT /accounts/:accountId actualiza correctamente la cuenta', async () => {
    const newName = 'Cuenta Actualizada INT';
    const newBalance = 999.99;

    const res = await request(app)
      .put(`/accounts/${mainAccountId}`)
      .send({
        NombreCuenta: newName,
        Dinero: newBalance,
      });

    if (res.statusCode !== 200) {
      console.error('❌ updateRes status/body:', res.statusCode, res.body);
    }

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('account');

    const account = res.body.account;
    expect(account.NombreCuenta).toBe(newName);
    expect(account.Dinero).toBe(newBalance);

    // Extra: comprobar que en GET también aparece actualizado
    const getRes = await request(app).get(`/accounts/${mainAccountId}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.account.NombreCuenta).toBe(newName);
    expect(getRes.body.account.Dinero).toBe(newBalance);
  });

  // --- 6) DELETE /accounts/:accountId elimina la cuenta ---
  test('DELETE /accounts/:accountId elimina la cuenta y deja de aparecer en el listado', async () => {
    const deleteRes = await request(app).delete(`/accounts/${mainAccountId}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty('success', true);

    // Después de borrar, GET /accounts/user/:userId no debe contener esa cuenta
    const listRes = await request(app).get(`/accounts/user/${testUserId}`);
    expect(listRes.statusCode).toBe(200);

    const accounts = listRes.body.accounts;
    const found = accounts.find(acc => acc.id_cuenta === mainAccountId);
    expect(found).toBeUndefined();
  });

  // ---------- Casos de error / validación (controllers) ----------

  test('POST /accounts sin userId devuelve 400', async () => {
    const res = await request(app)
      .post('/accounts')
      .send({
        accountName: 'Sin userId',
        initialBalance: 10,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /accounts sin accountName devuelve 400', async () => {
    const res = await request(app)
      .post('/accounts')
      .send({
        userId: testUserId,
        initialBalance: 10,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
  });

  // A partir de aquí, los test que ESPERAN error silencian console.error del backend

  test('GET /accounts/:accountId con ID inexistente devuelve error sin sacar logs molestos', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).get('/accounts/ID_QUE_NO_EXISTE');

    consoleErrorSpy.mockRestore();

    // Por cómo está implementado (service lanza error y controller lo captura),
    // ahora mismo suele ser 500. Si lo cambias a 404, esto seguirá valiendo.
    expect([500, 404]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('success', false);
  });

  test('PUT /accounts/:accountId con ID inexistente devuelve 400 sin mostrar logs', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app)
      .put('/accounts/ID_QUE_NO_EXISTE')
      .send({
        NombreCuenta: 'No existe',
        Dinero: 50,
      });

    consoleErrorSpy.mockRestore();

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('success', false);
  });

  test('DELETE /accounts/:accountId con ID inexistente devuelve 400 sin mostrar logs', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).delete('/accounts/ID_QUE_NO_EXISTE');

    consoleErrorSpy.mockRestore();

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('success', false);
  });
});
