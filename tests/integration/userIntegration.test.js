// tests/integration/accountIntregration.test.js

const request = require('supertest');
const Parse = require('../../src/config/parseConfig'); // mismo Parse que usa el backend
const app = require('../../src/app');                  // Express app sin listen()
const bcrypt = require('bcrypt');

jest.setTimeout(30000);

describe('Integración: /users', () => { 
  let baseUserId;            // usuario principal con el que pruebas
  let baseUserEmail;            // Email del usuario principal (para tests de login, getByEmail, etc.)
  const createdUserIds = [];    // cuenta principal para probar GET/PUT/DELETE

  // Crear usuario de pruebas en Parse antes de todos los tests
  beforeAll(async () => {
    const Usuarios = Parse.Object.extend('Usuarios');
    const user = new Usuarios();

    // 1) Definimos una contraseña de pruebas (en claro)
    const plainPassword = 'TestUser123!';

    // 2) La ciframos igual que hace tu servicio (bcrypt.hash) 
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const email = `int_user_${Date.now()}@palasaca.test`;

    user.set('Nombre', 'Usuario Integración Test');
    user.set('Correo', email);
    user.set('PassWord', hashedPassword);

    const savedUser = await user.save(null, { useMasterKey: true });
    baseUserId = savedUser.id;
    baseUserEmail = savedUser.get('Correo');

    console.log('✅ Usuario de test creado con id =', baseUserId);
  });

  // Limpiar Usuarios y usuario al final
  afterAll(async () => {
    try {
      if (createdUserIds.length > 0) {
        const Usuarios = Parse.Object.extend('Usuarios');
        const query = new Parse.Query(Usuarios);
        query.containedIn('objectId', createdUserIds);
        const users = await query.find({ useMasterKey: true });
        await Parse.Object.destroyAll(users, { useMasterKey: true });
      }

      if (baseUserId) {
        const Usuarios = Parse.Object.extend('Usuarios');
        const queryUser = new Parse.Query(Usuarios);
        const user = await queryUser.get(baseUserId, { useMasterKey: true });
        await user.destroy({ useMasterKey: true });
      }
    } catch (err) {
      console.error('⚠️ Error limpiando datos de test en afterAll:', err);
    }
  });

  describe('POST /users', () => {
    // --- 2) POST /accounts crea una cuenta correctamente ---
    test('POST /users crea un usuario nuevo con datos válidos', async () => {
        const name = 'Test POST /users';
        const email = `post_user_${Date.now()}@palasaca.test`;
        const password = 'PostUser123!';

        const res = await request(app)
        .post('/users')
        .send({ name, email, password });

        // Solo logueamos si realmente falla (para depurar)
        if (res.statusCode !== 201) {
            console.error('❌ createRes status/body:', res.statusCode, res.body);
        }

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('user');

        // Comprobamos que lo que devuelve el backend tiene los mismos datos
        expect(res.body.user).toMatchObject({
            name,
            email,
        });

        // Verificamos que el usuario existe realmente en Parse
        const Usuarios = Parse.Object.extend('Usuarios');
        const query = new Parse.Query(Usuarios);
        query.equalTo('Correo', email);
        const savedUser = await query.first({ useMasterKey: true });

        expect(savedUser).not.toBeNull();

        // Guardamos el id para poder borrarlo en afterAll
        createdUserIds.push(savedUser.id);
    });

    test('devuelve 400 si faltan campos obligatorios', async () => {
        const res = await request(app)
          .post('/users')
          .send({
            // Falta "name"
            email: `no_name_${Date.now()}@palasaca.test`,
            password: 'Test1234!',
          });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toContain('Todos los campos son obligatorios');
    });

    test('POST /users devuelve 400 si faltan campos obligatorios', async () => {
        const name = 'Usuario Duplicado';
        const email = baseUserEmail;
        const password = 'PostUser123!';

        const res = await request(app)
            .post('/users')
            .send({ name, email, password });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty(
            'error',
            'User already exists with the given email'
        );
    });
  });
});
