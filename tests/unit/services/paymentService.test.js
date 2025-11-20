// Mismo mock en todos los tests de services
jest.mock('../../../src/config/parseConfig', () => {
  const mockFind = jest.fn();
  const mockFirst = jest.fn();
  const mockEqualTo = jest.fn();
  const mockInclude = jest.fn();
  const mockDescending = jest.fn();
  const mockAscending = jest.fn();
  const mockSave = jest.fn();
  const mockSet = jest.fn();

  const Query = jest.fn().mockImplementation(() => ({
    equalTo: mockEqualTo,
    include: mockInclude,
    descending: mockDescending,
    ascending: mockAscending, // 👈 por consistencia
    find: mockFind,
    first: mockFirst,
  }));

  function ParseObject(className) {
    this.className = className;
    this.set = mockSet;
    this.save = mockSave;
    this.id = undefined;
  }

  // Para cosas tipo Parse.Object.extend("Pagos")
  ParseObject.extend = jest.fn().mockReturnValue(ParseObject);

  return {
    Object: ParseObject,
    Query,
    __mocks: {
      mockFind,
      mockFirst,
      mockEqualTo,
      mockInclude,
      mockDescending,
      mockAscending,
      mockSave,
      mockSet,
    },
  };
});

// 1) Mock de Parse (mismo bloque de antes)

const Parse = require('../../../src/config/parseConfig');
const { mockFind, mockSave } = Parse.__mocks;

const PaymentModel = require('../../../src/models/PaymentModel');
const paymentService = require('../../../src/services/paymentService');

describe('paymentService', () => {
  beforeEach(() => {
    mockFind.mockReset();
    mockSave.mockReset();
  });

  test('getPaymentsByAccount devuelve array de PaymentModel', async () => {
    const fakePayment = {
      id: 'pay1',
      get: (field) =>
        ({
          id_cuenta: { id: 'acc1' },
          nombre: 'Luz',
          importe: 60,
          tipo: 'gasto',
          fecha_limite: new Date('2024-01-10'),
          estado: 'pendiente',
          recordatorio: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        }[field]),
    };

    mockFind.mockResolvedValue([fakePayment]);

    const result = await paymentService.getPaymentsByAccount('acc1');

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(PaymentModel);
    // 👇 No comprobamos "id" porque el modelo no la expone así
    expect(result[0]).toMatchObject({
      id_cuenta: 'acc1',
      nombre: 'Luz',
      importe: 60,
    });
  });

  test('createPayment devuelve PaymentModel creado', async () => {
    const savedPayment = {
      id: 'pay2',
      set: jest.fn(), // 👈 necesario porque el service hace savedPayment.set(...)
      get: (field) =>
        ({
          id_cuenta: { id: 'acc1' },
          nombre: 'Agua',
          importe: 30,
          tipo: 'gasto',
          fecha_limite: new Date('2024-02-01'),
          estado: 'pendiente',
          recordatorio: false,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        }[field]),
    };

    mockSave.mockResolvedValue(savedPayment);

    const result = await paymentService.createPayment('acc1', {
      nombre: 'Agua',
      importe: 30,
      tipo: 'gasto',
      fecha_limite: '2024-02-01',
      estado: 'pendiente',
      recordatorio: false,
    });

    expect(result).toBeInstanceOf(PaymentModel);
    // 👇 igual, comprobamos los campos importantes pero no "id"
    expect(result).toMatchObject({
      id_cuenta: 'acc1',
      nombre: 'Agua',
      importe: 30,
    });
  });
});
