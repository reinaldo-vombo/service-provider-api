import { ReservationService } from '../src/modules/reservation/reservation.service';
import { prisma } from '../src/shared/prisma';
import { ReservationStatus } from '../src/generated/prisma';

jest.mock('../src/shared/prisma', () => ({
  prisma: {
    reservation: { findUnique: jest.fn(), update: jest.fn() },
    $disconnect: jest.fn(),
  },
}));

describe('updateReservation', () => {
  afterAll(async () => {
    await prisma.$disconnect?.();
  });

  it('deve atualizar uma reserva com sucesso', async () => {
    const reservation = {
      id: 'res-1',
      clientId: 'client-1',
      providerId: 'provider-1',
      amount: 1000,
      status: ReservationStatus.CONFIRMED,
    };

    (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(reservation);
    (prisma.reservation.update as jest.Mock).mockResolvedValue({
      ...reservation,
      status: ReservationStatus.COMPLETED,
    });

    const result = await ReservationService.updateReservation({
      reservationId: 'res-1',
      userId: 'provider-1',
      data: { status: ReservationStatus.COMPLETED },
    });

    expect(result.status).toBe(ReservationStatus.COMPLETED);
    expect(prisma.reservation.update).toHaveBeenCalledWith({
      where: { id: 'res-1' },
      data: { status: ReservationStatus.COMPLETED },
    });
  });

  it('deve lançar erro se a reserva não existir', async () => {
    (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      ReservationService.updateReservation({
        reservationId: 'invalid',
        userId: 'provider-1',
        data: { status: ReservationStatus.COMPLETED },
      })
    ).rejects.toThrow('Reserva não encontrada');
  });

  it('deve lançar erro se o usuário não for o provedor ou cliente', async () => {
    const reservation = {
      id: 'res-1',
      clientId: 'client-1',
      providerId: 'provider-1',
      status: ReservationStatus.CONFIRMED,
    };

    (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(reservation);

    await expect(
      ReservationService.updateReservation({
        reservationId: 'res-1',
        userId: 'other-user',
        data: { status: ReservationStatus.COMPLETED },
      })
    ).rejects.toThrow('Sem permissão para atualizar esta reserva');
  });
});
