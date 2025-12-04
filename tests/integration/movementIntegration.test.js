// tests/integration/movementIntegration.test.js

const request = require('supertest');
const Parse = require('../../src/config/parseConfig');
const app = require('../../src/app');

jest.setTimeout(30000);

describe('Integración: /movements', () => {
  let baseUserId;
  let baseAccountId;
  const createdMovementIds = [];
  let consoleErrorSpy;

  // 🔧 Creamos usuario + cuenta de pruebas en Parse antes de todos los tests
  beforeAll(async () => {
    // silenciar console.error de esta suite (para errores esperados)
    consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // 1) Usuario base
    const Usuarios = Parse.Object.extend('Usuarios');
    const user = new Usuarios();

    const plainPassword = 'MovementsTest123!';
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const email = `int_mov_${Date.now()}@palasaca.test`;

    user.set('Nombre', 'Usuario Movements INT');
    user.set('Correo', email);
    user.set('PassWord', hashedPassword);

    const savedUser = await user.save(null, { useMasterKey: true });
    baseUserId = savedUser.id;
    console.log('✅ Usuario base movements creado con id =', baseUserId);

    // 2) Cuenta base asociada a ese usuario
    const Cuentas = Parse.Object.extend('Cuentas');
    const account = new Cuentas();

    const userPointer = new Parse.Object('Usuarios');
    userPointer.id = baseUserId;

    account.set('id_usuario', userPointer);
    account.set('NombreCuenta', 'Cuenta Movements INT');
    account.set('Dinero', 1000); // saldo inicial

    const savedAccount = await account.save(null, { useMasterKey: true });
    baseAccountId = savedAccount.id;
    console.log('✅ Cuenta base movements creada con id =', baseAccountId);
  });

  // 🧹 Limpiar movimientos + cuenta + usuario al final
  afterAll(async () => {
    // restaurar console.error
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
    }

    try {
      const Movimiento = Parse.Object.extend('Movimiento');
      const Cuentas = Parse.Object.extend('Cuentas');
      const Usuarios = Parse.Object.extend('Usuarios');

      // 1) Borrar movimientos creados en los tests
      if (createdMovementIds.length > 0) {
        const qMov = new Parse.Query(Movimiento);
        qMov.containedIn('objectId', createdMovementIds);
        const movimientos = await qMov.find({ useMasterKey: true });
        await Parse.Object.destroyAll(movimientos, { useMasterKey: true });
      }

      // 2) Borrar cuenta base
      if (baseAccountId) {
        const qAcc = new Parse.Query(Cuentas);
        const account = await qAcc.get(baseAccountId, { useMasterKey: true });
        await account.destroy({ useMasterKey: true });
      }

      // 3) Borrar usuario base
      if (baseUserId) {
        const qUser = new Parse.Query(Usuarios);
        const user = await qUser.get(baseUserId, { useMasterKey: true });
        await user.destroy({ useMasterKey: true });
      }
    } catch (err) {
      console.error('⚠️ Error limpiando datos de movements en afterAll:', err);
    }
  });

  //
  // GET /movements/account/:accountId
  //
  describe('GET /movements/account/:accountId', () => {
    test('devuelve lista vacía si la cuenta no tiene movimientos', async () => {
      const res = await request(app).get(`/movements/account/${baseAccountId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.movements)).toBe(true);
      expect(res.body.movements.length).toBe(0);
    });
  });

  //
  // POST /movements
  //
  describe('POST /movements', () => {
    test('crea un gasto y actualiza el saldo de la cuenta', async () => {
      // saldo antes
      const Cuentas = Parse.Object.extend('Cuentas');
      const qAccBefore = new Parse.Query(Cuentas);
      const accBefore = await qAccBefore.get(baseAccountId, { useMasterKey: true });
      const saldoAntes = accBefore.get('Dinero') || 0;

      const body = {
        accountId: baseAccountId,
        Tipo: 'gasto',
        Cantidad: 50,           // positivo: el controller lo vuelve negativo
        Fijo: false,
        Categoria: 'Comida',
        Comentarios: 'Cena INT',
      };

      const res = await request(app).post('/movements').send(body);

      if (res.statusCode !== 201) {
        console.error('❌ create gasto status/body:', res.statusCode, res.body);
      }

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('movement');

      const movement = res.body.movement;

      expect(movement).toMatchObject({
        id_cuenta: baseAccountId,
        Tipo: 'gasto',
        Fijo: false,
        Categoria: 'Comida',
        Comentarios: 'Cena INT',
      });
      expect(movement.Cantidad).toBeLessThan(0); // debe estar en negativo

      const movementId = movement.id_movimiento;
      createdMovementIds.push(movementId);

      // comprobar en Parse que la cantidad es -50
      const Movimiento = Parse.Object.extend('Movimiento');
      const qMov = new Parse.Query(Movimiento);
      const savedMov = await qMov.get(movementId, { useMasterKey: true });
      expect(savedMov.get('Cantidad')).toBeCloseTo(-50);

      // saldo después
      const qAccAfter = new Parse.Query(Cuentas);
      const accAfter = await qAccAfter.get(baseAccountId, { useMasterKey: true });
      const saldoDespues = accAfter.get('Dinero') || 0;

      expect(saldoDespues).toBeCloseTo(saldoAntes - 50);
    });

    test('crea un ingreso y actualiza el saldo de la cuenta', async () => {
      // saldo antes
      const Cuentas = Parse.Object.extend('Cuentas');
      const qAccBefore = new Parse.Query(Cuentas);
      const accBefore = await qAccBefore.get(baseAccountId, { useMasterKey: true });
      const saldoAntes = accBefore.get('Dinero') || 0;

      const body = {
        accountId: baseAccountId,
        Tipo: 'ingreso',
        Cantidad: -100,         // negativo: el controller lo vuelve positivo
        Fijo: true,
        Categoria: 'Nómina',
        Comentarios: 'Ingreso INT',
      };

      const res = await request(app).post('/movements').send(body);

      if (res.statusCode !== 201) {
        console.error('❌ create ingreso status/body:', res.statusCode, res.body);
      }

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('movement');

      const movement = res.body.movement;

      expect(movement).toMatchObject({
        id_cuenta: baseAccountId,
        Tipo: 'ingreso',
        Fijo: true,
        Categoria: 'Nómina',
        Comentarios: 'Ingreso INT',
      });
      expect(movement.Cantidad).toBeGreaterThan(0); // debe estar en positivo

      const movementId = movement.id_movimiento;
      createdMovementIds.push(movementId);

      // comprobar en Parse que la cantidad es +100
      const Movimiento = Parse.Object.extend('Movimiento');
      const qMov = new Parse.Query(Movimiento);
      const savedMov = await qMov.get(movementId, { useMasterKey: true });
      expect(savedMov.get('Cantidad')).toBeCloseTo(100);

      // saldo después
      const qAccAfter = new Parse.Query(Cuentas);
      const accAfter = await qAccAfter.get(baseAccountId, { useMasterKey: true });
      const saldoDespues = accAfter.get('Dinero') || 0;

      expect(saldoDespues).toBeCloseTo(saldoAntes + 100);
    });

    test('devuelve 400 si faltan campos obligatorios', async () => {
      // falta Tipo y Cantidad
      const res = await request(app).post('/movements').send({
        accountId: baseAccountId,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty(
        'error',
        'Account ID, Tipo and Cantidad are required'
      );
    });

    test("devuelve 400 si Tipo no es 'gasto' ni 'ingreso'", async () => {
      const res = await request(app).post('/movements').send({
        accountId: baseAccountId,
        Tipo: 'otro',
        Cantidad: 10,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty(
        'error',
        "Tipo must be 'gasto' or 'ingreso'"
      );
    });
  });

  //
  // GET /movements/account/:accountId (después de crear movimientos)
  //
  describe('GET /movements/account/:accountId (con movimientos)', () => {
    test('devuelve los movimientos creados para la cuenta', async () => {
      const res = await request(app).get(`/movements/account/${baseAccountId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.movements)).toBe(true);
      expect(res.body.movements.length).toBeGreaterThanOrEqual(2);

      const ids = res.body.movements.map(m => m.id_movimiento);
      // deben contener los movimientos que hemos ido guardando
      createdMovementIds.forEach(id => {
        expect(ids).toContain(id);
      });
    });
  });
});
