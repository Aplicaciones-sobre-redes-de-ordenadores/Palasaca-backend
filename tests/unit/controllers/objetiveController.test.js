// tests/unit/controllers/objetivosController.test.js
const {
  getObjetivosByAccount,
  createObjetivo,
  updateObjetivoProgress,
} = require('../../../src/controllers/objectiveController'); // ajusta el nombre del archivo si es distinto

jest.mock('../../../src/services/objectivesService', () => ({
  getObjetivosByAccount: jest.fn(),
  createObjetivo: jest.fn(),
  updateObjetivoProgress: jest.fn(),
}));

const objetivosService = require('../../../src/services/objectivesService');

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

describe('objetivosController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /objetivos/cuenta/:accountId
  describe('getObjetivosByAccount', () => {
    test('devuelve 400 si falta accountId', async () => {
      const req = { params: {} };
      const res = mockResponse();

      await getObjetivosByAccount(req, res);

      expect(objetivosService.getObjetivosByAccount).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Account ID is required',
      });
    });

    test('devuelve 200 y lista de objetivos si todo va bien', async () => {
      const fakeObjetivos = [
        {
          toJSON: () => ({
            id: 'obj1',
            id_cuenta: 'acc1',
            Descripcion: 'Viaje',
            PorcentajeAhorro: 20,
            Cantidad_Objetivo: 1000,
            Cantidad_Actual: 200,
            Fecha_Inicio: '2024-01-01',
            Fecha_Fin: '2024-06-01',
            imagenObjetivo: null,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
          }),
        },
        {
          toJSON: () => ({
            id: 'obj2',
            id_cuenta: 'acc1',
            Descripcion: 'Coche',
            PorcentajeAhorro: 10,
            Cantidad_Objetivo: 5000,
            Cantidad_Actual: 0,
            Fecha_Inicio: '2024-02-01',
            Fecha_Fin: null,
            imagenObjetivo: null,
            createdAt: '2024-02-01',
            updatedAt: '2024-02-02',
          }),
        },
      ];

      objetivosService.getObjetivosByAccount.mockResolvedValue(fakeObjetivos);

      const req = { params: { accountId: 'acc1' } };
      const res = mockResponse();

      await getObjetivosByAccount(req, res);

      expect(objetivosService.getObjetivosByAccount).toHaveBeenCalledWith('acc1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        objetivos: [
          {
            id: 'obj1',
            id_cuenta: 'acc1',
            Descripcion: 'Viaje',
            PorcentajeAhorro: 20,
            Cantidad_Objetivo: 1000,
            Cantidad_Actual: 200,
            Fecha_Inicio: '2024-01-01',
            Fecha_Fin: '2024-06-01',
            imagenObjetivo: null,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
          },
          {
            id: 'obj2',
            id_cuenta: 'acc1',
            Descripcion: 'Coche',
            PorcentajeAhorro: 10,
            Cantidad_Objetivo: 5000,
            Cantidad_Actual: 0,
            Fecha_Inicio: '2024-02-01',
            Fecha_Fin: null,
            imagenObjetivo: null,
            createdAt: '2024-02-01',
            updatedAt: '2024-02-02',
          },
        ],
      });
    });

    test('devuelve 500 si el servicio lanza un error', async () => {
      objetivosService.getObjetivosByAccount.mockRejectedValue(
        new Error('db error')
      );

      const req = { params: { accountId: 'acc1' } };
      const res = mockResponse();

      await getObjetivosByAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'db error',
      });
    });
  });

  // POST /objetivos
  describe('createObjetivo', () => {
    test('devuelve 400 si faltan campos obligatorios', async () => {
      const req = {
        body: {
          // falta id_cuenta y Fecha_Inicio, por ejemplo
          PorcentajeAhorro: 20,
          Cantidad_Objetivo: 1000,
        },
      };
      const res = mockResponse();

      await createObjetivo(req, res);

      expect(objetivosService.createObjetivo).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error:
          'id_cuenta, PorcentajeAhorro, Cantidad_Objetivo y Fecha_Inicio son obligatorios',
      });
    });

    test('devuelve 201 y el objetivo creado si todo va bien (con defaults)', async () => {
      const body = {
        id_cuenta: 'acc1',
        Descripcion: 'Viaje',
        PorcentajeAhorro: '20',
        Cantidad_Objetivo: '1000',
        // sin Cantidad_Actual → 0
        Fecha_Inicio: '2024-01-01',
        // sin Fecha_Fin → null
        // sin imagenObjetivo → null
      };

      const fakeObjetivo = {
        toJSON: () => ({
          id: 'obj1',
          id_cuenta: 'acc1',
          Descripcion: 'Viaje',
          PorcentajeAhorro: 20,
          Cantidad_Objetivo: 1000,
          Cantidad_Actual: 0,
          Fecha_Inicio: '2024-01-01',
          Fecha_Fin: null,
          imagenObjetivo: null,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        }),
      };

      objetivosService.createObjetivo.mockResolvedValue(fakeObjetivo);

      const req = { body };
      const res = mockResponse();

      await createObjetivo(req, res);

      // objetivoData que construye el controller
      expect(objetivosService.createObjetivo).toHaveBeenCalledWith('acc1', {
        Descripcion: 'Viaje',
        PorcentajeAhorro: 20,
        Cantidad_Objetivo: 1000,
        Cantidad_Actual: 0,
        Fecha_Inicio: '2024-01-01',
        Fecha_Fin: null,
        imagenObjetivo: null,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Objetivo creado exitosamente',
        objetivo: {
          id: 'obj1',
          id_cuenta: 'acc1',
          Descripcion: 'Viaje',
          PorcentajeAhorro: 20,
          Cantidad_Objetivo: 1000,
          Cantidad_Actual: 0,
          Fecha_Inicio: '2024-01-01',
          Fecha_Fin: null,
          imagenObjetivo: null,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
      });
    });

    test('devuelve 400 si el servicio lanza un error', async () => {
      objetivosService.createObjetivo.mockRejectedValue(
        new Error('create error')
      );

      const req = {
        body: {
          id_cuenta: 'acc1',
          Descripcion: 'Viaje',
          PorcentajeAhorro: 20,
          Cantidad_Objetivo: 1000,
          Cantidad_Actual: 100,
          Fecha_Inicio: '2024-01-01',
        },
      };
      const res = mockResponse();

      await createObjetivo(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'create error',
      });
    });
  });

  // PUT /objetivos/:id
  describe('updateObjetivoProgress', () => {
    test('devuelve 400 si faltan id o Cantidad_Actual', async () => {
      const req = { params: {}, body: {} };
      const res = mockResponse();

      await updateObjetivoProgress(req, res);

      expect(objetivosService.updateObjetivoProgress).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Objective ID and Cantidad_Actual are required',
      });
    });

    test('devuelve 200 y el objetivo actualizado si todo va bien', async () => {
      const fakeObjetivo = {
        toJSON: () => ({
          id: 'obj1',
          id_cuenta: 'acc1',
          Descripcion: 'Viaje',
          PorcentajeAhorro: 20,
          Cantidad_Objetivo: 1000,
          Cantidad_Actual: 500,
          Fecha_Inicio: '2024-01-01',
          Fecha_Fin: '2024-06-01',
          imagenObjetivo: null,
          createdAt: '2024-01-01',
          updatedAt: '2024-03-01',
        }),
      };

      objetivosService.updateObjetivoProgress.mockResolvedValue(fakeObjetivo);

      const req = {
        params: { id: 'obj1' },
        body: { Cantidad_Actual: 500 },
      };
      const res = mockResponse();

      await updateObjetivoProgress(req, res);

      expect(objetivosService.updateObjetivoProgress).toHaveBeenCalledWith(
        'obj1',
        500
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Progreso de objetivo actualizado correctamente',
        objetivo: {
          id: 'obj1',
          id_cuenta: 'acc1',
          Descripcion: 'Viaje',
          PorcentajeAhorro: 20,
          Cantidad_Objetivo: 1000,
          Cantidad_Actual: 500,
          Fecha_Inicio: '2024-01-01',
          Fecha_Fin: '2024-06-01',
          imagenObjetivo: null,
          createdAt: '2024-01-01',
          updatedAt: '2024-03-01',
        },
      });
    });

    test('devuelve 500 si el servicio lanza un error', async () => {
      objetivosService.updateObjetivoProgress.mockRejectedValue(
        new Error('update error')
      );

      const req = {
        params: { id: 'obj1' },
        body: { Cantidad_Actual: 300 },
      };
      const res = mockResponse();

      await updateObjetivoProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'update error',
      });
    });
  });
});
