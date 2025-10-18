import { prisma } from '../../shared/prisma';
import ApiError from '../../error/ApiError';
import httpStatus from 'http-status';
import { User } from '../../generated/prisma';
import { TransactionType } from '../reservation/reservation.uitils';

export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        nif: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
      },
    });
    return users;
  } catch (error: any) {
    console.error(error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Erro ao listar usuários'
    );
  }
};

// ✅ Buscar usuário por ID
export const getUserById = async (userId: string | undefined) => {
  if (!userId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Id do utilizador é obrigatorio'
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
      },
    });

    if (!user)
      throw new ApiError(httpStatus.NOT_FOUND, 'Usuário não encontrado');
    return user;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Erro ao buscar usuário'
    );
  }
};

export const updateUser = async (userId: string | undefined, info: User) => {
  if (!userId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Id do utilizador é obrigatorio'
    );
  }
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: info,
      select: {
        id: true,
        fullName: true,
        email: true,
        nif: true,
        balance: true,
      },
    });

    return updatedUser;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Erro ao atualizar usuário'
    );
  }
};

// ✅ Deletar usuário
export const deleteUser = async (userId: string | undefined) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      throw new ApiError(httpStatus.NOT_FOUND, 'Usuário não encontrado');

    await prisma.user.delete({ where: { id: userId } });
    return user;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Erro ao deletar usuário'
    );
  }
};

// ✅ Atualizar saldo (depositar dinheiro no balance)
export const updateUserBalance = async (
  userId: string | undefined,
  amount: number
) => {
  if (!userId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Id do utilizador é obrigatorio'
    );
  }

  try {
    //  const value = parseFloat(amount);
    const value = amount;
    if (isNaN(value) || value <= 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Valor inválido para depósito'
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      throw new ApiError(httpStatus.NOT_FOUND, 'Usuário não encontrado');

    const updatedUser = await prisma.$transaction(async (tx) => {
      // Atualiza saldo
      const updated = await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: value } },
      });

      // Cria log de transação
      await tx.transactionLog.create({
        data: {
          userId,
          amount: value,
          balanceAfter: updated.balance,
          balanceBefore: user.balance,
          type: TransactionType.CREDIT,
          description: 'Depósito de saldo',
        },
      });

      return updated;
    });
    return updatedUser;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Erro ao atualizar saldo'
    );
  }
};

export const UsersServices = {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  updateUserBalance,
};
