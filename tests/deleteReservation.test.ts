import { ReservationService } from '../src/modules/reservation/reservation.service';
import { prisma } from '../src/shared/prisma';
import { ReservationStatus } from '../src/generated/prisma';

jest.mock('../src/shared/prisma', () => ({
  prisma: {
    reservation: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

describe('deleteReservation', () => {
  afterAll(async () => {
    await prisma.$disconnect?.();
  });

  it('deve deletar uma reserva com sucesso (cliente)', async () => {
    const mockReservation = {
      id: 'res-1',
      clientId: 'client-1',
      providerId: 'provider-1',
    };

    (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(
      mockReservation
    );
    (prisma.reservation.delete as jest.Mock).mockResolvedValue(mockReservation);

    const result = await ReservationService.deleteReservation(
      'res-1',
      'client-1'
    );

    expect(result).toEqual(mockReservation);
    expect(prisma.reservation.delete).toHaveBeenCalledWith({
      where: { id: 'res-1' },
    });
  });

  it('deve lançar erro se reserva não for encontrada', async () => {
    (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      ReservationService.deleteReservation('invalid', 'client-1')
    ).rejects.toThrow('Reserva não encontrada');
  });

  it('deve lançar erro se usuário não tiver permissão', async () => {
    (prisma.reservation.findUnique as jest.Mock).mockResolvedValue({
      id: 'res-1',
      clientId: 'client-1',
      providerId: 'provider-1',
    });

    await expect(
      ReservationService.deleteReservation('res-1', 'other-user')
    ).rejects.toThrow('Sem permissão para deletar esta reserva');
  });

  it('deve permitir exclusão por admin', async () => {
    const mockReservation = {
      id: 'res-1',
      clientId: 'client-1',
      providerId: 'provider-1',
    };

    (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(
      mockReservation
    );
    (prisma.reservation.delete as jest.Mock).mockResolvedValue(mockReservation);

    const result = await ReservationService.deleteReservation(
      'res-1',
      'admin-1'
    );

    expect(result).toEqual(mockReservation);
  });
});
