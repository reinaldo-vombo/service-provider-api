import { ReservationService } from '../src/modules/reservation/reservation.service';
import { prisma } from '../src/shared/prisma';
import { ReservationStatus, TransactionType } from '../src/generated/prisma';

jest.mock('../src/shared/prisma', () => ({
  prisma: {
    reservation: { findUnique: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn() },
    transactionLog: { createMany: jest.fn() },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

describe('cancelReservation', () => {
  afterAll(async () => {
    await prisma.$disconnect?.();
  });

  it('deve cancelar a reserva com sucesso e reembolsar o cliente', async () => {
    const reservation = {
      id: 'res-1',
      clientId: 'client-1',
      providerId: 'provider-1',
      amount: 1000,
      status: ReservationStatus.CONFIRMED,
    };

    const client = { id: 'client-1', balance: 2000 };
    const provider = { id: 'provider-1', balance: 5000 };

    (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(reservation);

    // simula a transação Prisma
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      const tx = {
        user: {
          findUnique: jest
            .fn()
            .mockImplementation(({ where }) =>
              where.id === 'client-1' ? client : provider
            ),
          update: jest.fn().mockImplementation(({ where, data }) => {
            if (where.id === 'client-1') {
              return {
                ...client,
                balance: client.balance + reservation.amount,
              };
            }
            if (where.id === 'provider-1') {
              return {
                ...provider,
                balance: provider.balance - reservation.amount,
              };
            }
          }),
        },
        reservation: {
          update: jest.fn().mockResolvedValue({
            ...reservation,
            status: ReservationStatus.CANCELLED,
          }),
        },
        transactionLog: { createMany: jest.fn().mockResolvedValue(true) },
      };

      return callback(tx);
    });

    const result = await ReservationService.cancelReservation({
      reservationId: 'res-1',
      userId: 'client-1',
    });

    expect(result.status).toBe(ReservationStatus.CANCELLED);
    expect(prisma.reservation.findUnique).toHaveBeenCalledWith({
      where: { id: 'res-1' },
    });
  });

  it('deve lançar erro se reserva não for encontrada', async () => {
    (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      ReservationService.cancelReservation({
        reservationId: 'invalid',
        userId: 'client-1',
      })
    ).rejects.toThrow('Reserva não encontrada');
  });

  it('deve lançar erro se a reserva não estiver CONFIRMED', async () => {
    (prisma.reservation.findUnique as jest.Mock).mockResolvedValue({
      id: 'res-1',
      status: ReservationStatus.CANCELLED,
      clientId: 'client-1',
      providerId: 'provider-1',
    });

    await expect(
      ReservationService.cancelReservation({
        reservationId: 'res-1',
        userId: 'client-1',
      })
    ).rejects.toThrow('A reserva não pode ser cancelada neste estado');
  });

  it('deve lançar erro se o usuário não tiver permissão', async () => {
    (prisma.reservation.findUnique as jest.Mock).mockResolvedValue({
      id: 'res-1',
      status: ReservationStatus.CONFIRMED,
      clientId: 'client-1',
      providerId: 'provider-1',
    });

    await expect(
      ReservationService.cancelReservation({
        reservationId: 'res-1',
        userId: 'other-user',
      })
    ).rejects.toThrow('Sem permissão para cancelar esta reserva');
  });
});
