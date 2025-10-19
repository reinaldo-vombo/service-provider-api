import { ReservationService } from '../src/modules/reservation/reservation.service';
import { prisma } from '../src/shared/prisma';
import ApiError from '../src/error/ApiError';
import { ReservationStatus, TransactionType } from '../src/generated/prisma';

// 🔹 Mock do prisma — assim não toca no banco real
jest.mock('../src/shared/prisma', () => ({
  prisma: {
    service: { findUnique: jest.fn() },
    user: { findUnique: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
    transactionLog: { createMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

describe('createReservation', () => {
  const mockService = {
    id: 'service123',
    price: 100,
    providerId: 'provider123',
    provider: { id: 'provider123' },
  };

  const mockClient = { id: 'client123', balance: 200 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve lançar erro se clientId for indefinido', async () => {
    await expect(
      ReservationService.createReservation(undefined, 'service123')
    ).rejects.toThrow(new ApiError(404, 'Id do cliente é obrigatorio'));
  });

  it('deve lançar erro se o serviço não existir', async () => {
    (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      ReservationService.createReservation('client123', 'invalido')
    ).rejects.toThrow('Serviço não encontrado');
  });

  it('deve lançar erro se o cliente tentar reservar o próprio serviço', async () => {
    (prisma.service.findUnique as jest.Mock).mockResolvedValue({
      ...mockService,
      providerId: 'client123',
    });

    await expect(
      ReservationService.createReservation('client123', 'service123')
    ).rejects.toThrow('Não podes reservar o próprio serviço');
  });

  it('deve criar uma reserva com sucesso', async () => {
    (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockClient);

    // simula transação bem-sucedida
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback({
        user: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          update: jest.fn().mockResolvedValue({ balance: 300 }),
          findUnique: jest.fn().mockResolvedValue({ balance: 100 }),
        },
        reservation: {
          create: jest.fn().mockResolvedValue({
            id: 'res123',
            status: ReservationStatus.CONFIRMED,
          }),
        },
        transactionLog: { createMany: jest.fn() },
      });
    });

    const reservation = await ReservationService.createReservation(
      'client123',
      'service123'
    );

    expect(reservation.id).toBe('res123');
    expect(reservation.status).toBe(ReservationStatus.CONFIRMED);
  });

  it('deve lançar erro se saldo insuficiente', async () => {
    (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockClient);

    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      const tx = {
        user: {
          updateMany: jest.fn().mockResolvedValue({ count: 0 }), // saldo insuficiente
        },
      };
      return callback(tx);
    });

    await expect(
      ReservationService.createReservation('client123', 'service123')
    ).rejects.toThrow('Saldo insuficiente');
  });
});
// afterAll(async () => {
//   await prisma.$disconnect();
// });
