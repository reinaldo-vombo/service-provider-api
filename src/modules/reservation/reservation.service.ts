// services/reservationService.ts

import ApiError from '../../error/ApiError';
import httpStatus from 'http-status';
import { prisma } from '../../shared/prisma';
import { ReservationStatus, TransactionType } from './reservation.uitils';

const createReservation = async (
  clientId: string | undefined,
  serviceId: string
) => {
  if (!clientId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Id do cliente é obrigatorio');
  }
  // busca service e provider
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { provider: true },
  });
  if (!service)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Serviço não encontrado');

  const amount = service.price; // em centavos
  const providerId = service.providerId;

  if (providerId === clientId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Não podes reservar o próprio serviço'
    );
  }
  const client = await prisma.user.findUnique({ where: { id: clientId } });
  if (!client)
    throw new ApiError(httpStatus.NOT_FOUND, 'Cliente não encontrado');

  // Transação atômica
  const reservation = await prisma.$transaction(async (tx) => {
    // 1) tentar debitar cliente **somente** se saldo >= amount
    const debitResult = await tx.user.updateMany({
      where: { id: clientId, balance: { gte: amount } },
      data: { balance: { decrement: amount } },
    });

    if (debitResult.count === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Saldo insuficiente');
    }

    // 2) creditar prestador
    const provider = await tx.user.update({
      where: { id: providerId },
      data: { balance: { increment: amount } },
    });

    // 3) criar reserva
    const newReservation = await tx.reservation.create({
      data: {
        clientId,
        providerId,
        serviceId,
        amount,
        status: ReservationStatus.CONFIRMED,
      },
    });

    const clientAfter = await tx.user.findUnique({ where: { id: clientId } });
    const providerAfter = await tx.user.findUnique({
      where: { id: providerId },
    });

    await tx.transactionLog.createMany({
      data: [
        {
          userId: clientId,
          type: TransactionType.DEBIT,
          amount,
          balanceBefore: client.balance,
          balanceAfter: clientAfter!.balance,
          reservationId: reservation.id,
        },
        {
          userId: providerId,
          type: TransactionType.CREDIT,
          amount,
          balanceBefore: provider.balance - amount,
          balanceAfter: providerAfter!.balance,
          reservationId: reservation.id,
        },
      ],
    });

    return newReservation;
  });
  return reservation;
};
const getAllTransationLogs = async () => {
  const logs = await prisma.transactionLog.findMany();

  return logs;
};
const getSingleTransationLogs = async (transactionLogId: string) => {
  const log = await prisma.transactionLog.findUnique({
    where: { id: transactionLogId },
  });

  return log;
};
const cancelReservation = async ({
  reservationId,
  userId,
}: {
  reservationId: string;
  userId: string;
}) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation)
      throw new ApiError(httpStatus.NOT_FOUND, 'Reserva não encontrada');

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'A reserva não pode ser cancelada neste estado'
      );
    }

    // Só cliente ou provider associado pode cancelar
    if (reservation.clientId !== userId && reservation.providerId !== userId) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        'Sem permissão para cancelar'
      );
    }

    const { clientId, providerId, amount } = reservation;

    await prisma.$transaction(async (tx) => {
      // Atualizar status
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.CANCELLED },
      });

      // Debitar provider (somente se tiver saldo suficiente)
      const debitProvider = await tx.user.updateMany({
        where: { id: providerId, balance: { gte: amount } },
        data: { balance: { decrement: amount } },
      });
      if (debitProvider.count === 0)
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Saldo do prestador insuficiente'
        );

      // Creditar cliente (reembolso)
      const client = await tx.user.findUnique({ where: { id: clientId } });
      if (!client)
        throw new ApiError(httpStatus.NOT_FOUND, 'Cliente não encontrado');

      const beforeBalance = client.balance;
      const afterBalance = beforeBalance + amount;

      await tx.user.update({
        where: { id: clientId },
        data: { balance: { increment: amount } },
      });

      // Registrar logs de transação
      await tx.transactionLog.createMany({
        data: [
          {
            userId: providerId,
            type: TransactionType.REFUND,
            amount,
            balanceBefore: 0, // pode buscar saldo anterior se quiser log detalhado
            balanceAfter: 0,
            reservationId,
          },
          {
            userId: clientId,
            type: TransactionType.REFUND,
            amount,
            balanceBefore: beforeBalance,
            balanceAfter: afterBalance,
            reservationId,
          },
        ],
      });
    });

    return reservation;
  } catch (error: any) {
    console.error(error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Erro ao cancelar reserva');
  }
};

const updateReservation = async (
  reservationId: string,
  userId: string,
  status: ReservationStatus
) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { client: true },
    });

    if (!reservation) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Reserva não encontrada');
    }

    // Verifica se o usuário é o dono
    if (reservation.clientId !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Sem permissão');
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status },
    });

    return updated;
  } catch (error) {
    console.error(error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Erro ao atualizar reserva'
    );
  }
};

const deleteReservation = async (reservationId: string, userId: string) => {
  try {
    const currentReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!currentReservation) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Reserva não encontrada');
    }

    if (currentReservation.clientId !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Sem permissão');
    }

    // Se reserva foi confirmada, reembolsa
    if (currentReservation.status === ReservationStatus.CONFIRMED) {
      const service = await prisma.service.findUnique({
        where: { id: currentReservation.serviceId },
      });

      if (service) {
        await prisma.$transaction([
          // Reembolsa o cliente
          prisma.user.update({
            where: { id: currentReservation.clientId },
            data: { balance: { increment: currentReservation.amount } },
          }),
          // Debita do prestador
          prisma.user.update({
            where: { id: service.providerId },
            data: { balance: { decrement: currentReservation.amount } },
          }),
          // Log da transação
          prisma.transactionLog.create({
            data: {
              userId: currentReservation.clientId,
              amount: currentReservation.amount,
              type: TransactionType.REFUND,
              balanceBefore: 0,
              balanceAfter: 0,
              description: 'Reembolso por cancelamento de reserva',
            },
          }),
        ]);
      }
    }

    const reservation = await prisma.reservation.delete({
      where: { id: reservationId },
    });

    return reservation;
  } catch (error) {
    console.error(error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Erro ao deletar reserva'
    );
  }
};

export const ReservationService = {
  createReservation,
  getAllTransationLogs,
  getSingleTransationLogs,
  cancelReservation,
  updateReservation,
  deleteReservation,
};
