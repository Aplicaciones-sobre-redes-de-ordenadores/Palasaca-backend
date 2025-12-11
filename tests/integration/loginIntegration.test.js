// tests/integration/loginIntegration.test.js

const request = require('supertest');
const bcrypt = require('bcrypt');
const Parse = require('../../src/config/parseConfig'); // mismo Parse que usa el backend
const app = require('../../src/app');                  // Express app sin listen()

jest.setTimeout(30000);

describe('Integración: /login', () => {
  let baseUserId;            // Usuario principal sobre el que probamos el login
  let baseUserEmail;         // Email del usuario base
  let baseUserPassword;      // Contraseña en claro del usuario base
  const createdUserIds = []; // Por si en el futuro creas más usuarios en los tests
  let consoleErrorSpy;       // Para mutear console.error

  // ===================== BEFORE ALL =====================
  beforeAll(async () => {
    // Muteamos TODOS los console.error de esta suite (para que Parse no llene el log en errores esperados)
    consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const Usuarios = Parse.Object.extend('Usuarios');
    const user = new Usuarios();

    // Contraseña en claro que vamos a usar en el login
    baseUserPassword = 'LoginTest123!';

    // Hasheamos la contraseña igual que hace tu servicio
    const hashedPassword = await bcrypt.hash(baseUserPassword, 10);
    const email = `login_int_${Date.now()}@palasaca.test`;

    user.set('Nombre', 'Usuario Login INT');
    user.set('Correo', email);
    user.set('PassWord', hashedPassword);

    const savedUser = await user.save(null, { useMasterKey: true });
    baseUserId = savedUser.id;
    baseUserEmail = savedUser.get('Correo');

    console.log('✅ Usuario base para /login creado con id =', baseUserId);
  });

  // ===================== AFTER ALL =====================
  afterAll(async () => {
    // restauramos console.error
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
    }

    try {
      const Usuarios = Parse.Object.extend('Usuarios');

      // Borrar posibles usuarios extra creados en los tests
      if (createdUserIds.length > 0) {
        const queryExtra = new Parse.Query(Usuarios);
        queryExtra.containedIn('objectId', createdUserIds);
        const extras = await queryExtra.find({ useMasterKey: true });
        await Parse.Object.destroyAll(extras, { useMasterKey: true });
      }

      // Borrar el usuario base
      if (baseUserId) {
        const queryBase = new Parse.Query(Usuarios);
        const baseUser = await queryBase.get(baseUserId, { useMasterKey: true });
        await baseUser.destroy({ useMasterKey: true });
      }
    } catch (err) {
      console.error('⚠️ Error limpiando datos de test en afterAll (/login):', err);
      // No relanzamos para no romper el cierre de Jest
    }
  });

  // ===================== TESTS =====================

  describe('POST /login', () => {
    test('devuelve 200 y objectId con email y password correctos', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: baseUserEmail,
          password: baseUserPassword,
        });

      if (res.statusCode !== 200) {
        console.error('❌ /login OK esperado, status/body:', res.statusCode, res.body);
      }

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('objectId', baseUserId);
      expect(res.body.user).toHaveProperty('email', baseUserEmail);
    });

    test('devuelve 401 con contraseña incorrecta', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: baseUserEmail,
          password: 'ContraseñaIncorrecta123!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });

    test('devuelve 401 si el email no existe', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: `no_existe_${Date.now()}@palasaca.test`,
          password: 'LoQueSea123!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });

    // Opcional: si quieres cubrir también el caso de body incompleto
    test('devuelve 500 si faltan campos (email o password)', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          // Falta password
          email: baseUserEmail,
        });

      // Tu controlador ahora mismo no valida campos,
      // así que lo más probable es que el service lance
      // y se responda 500.
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
    });
  });
});
