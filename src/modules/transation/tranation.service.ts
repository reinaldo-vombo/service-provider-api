import ApiError from '../../error/ApiError';
import httpStatus from 'http-status';
import { prisma } from '../../shared/prisma';
import { Service } from '../../generated/prisma';

const getAllTransation = async () => {
  try {
    const transactionLog = await prisma.transactionLog.findMany({
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return transactionLog;
  } catch (error: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};
const getAllUserTransation = async (userId: string) => {
  try {
    const transactionLog = await prisma.transactionLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return transactionLog;
  } catch (error: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

export const TransactionLogService = {
  getAllTransation,
  getAllUserTransation,
};
