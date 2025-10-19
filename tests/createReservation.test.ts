import { ReservationService } from '../src/modules/reservation/reservation.service';
import { prisma } from '../src/shared/prisma';
import {
  ReservationStatus,
  TransactionType,
} from '../src/modules/reservation/reservation.uitils';

// Mock do Prisma
jest.mock('../src/shared/prisma', () => ({
  prisma: {
    service: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  },
}));

describe('createReservation', () => {
  afterAll(async () => {
    await prisma.$disconnect?.();
  });

  it('deve criar uma reserva com sucesso', async () => {
    // Serviço e usuários simulados
    const service = {
      id: 'service-1',
      price: 1000,
      providerId: 'provider-1',
      provider: { id: 'provider-1', name: 'Maria' },
    };
    const client = { id: 'client-1', balance: 2000 };
    const provider = { id: 'provider-1', balance: 1000 };

    // Mocks fora da transação
    (prisma.service.findUnique as jest.Mock).mockResolvedValue(service);
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(client);

    // Mock da transação
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      const tx = {
        user: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }), // débito OK
          update: jest.fn().mockResolvedValue(provider), // crédito OK
          findUnique: jest
            .fn()
            .mockResolvedValueOnce({ id: 'client-1', balance: 1000 }) // clientAfter
            .mockResolvedValueOnce({ id: 'provider-1', balance: 2000 }), // providerAfter
        },
        reservation: {
          create: jest.fn().mockResolvedValue({
            id: 'res-1',
            clientId: 'client-1',
            providerId: 'provider-1',
            serviceId: 'service-1',
            amount: 1000,
            status: ReservationStatus.CONFIRMED,
          }),
        },
        transactionLog: { createMany: jest.fn().mockResolvedValue(true) },
      };

      return callback(tx);
    });

    // Executa
    const result = await ReservationService.createReservation(
      'client-1',
      'service-1'
    );

    // Verifica resultado
    expect(result).toEqual(
      expect.objectContaining({
        id: 'res-1',
        clientId: 'client-1',
        providerId: 'provider-1',
        serviceId: 'service-1',
        status: ReservationStatus.CONFIRMED,
      })
    );

    // Verifica chamadas principais
    expect(prisma.service.findUnique).toHaveBeenCalledWith({
      where: { id: 'service-1' },
      include: { provider: true },
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'client-1' },
    });
  });
});
