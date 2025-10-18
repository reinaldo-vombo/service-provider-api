import asyncHandler from '../../shared/asyncHandler';
import httpStatus from 'http-status';
import sendResponse from '../../shared/sendResponse';
import { Reservation, TransactionLog } from '../../generated/prisma';
import { TransactionLogService } from './tranation.service';

const getAllTransation = asyncHandler(async (req, res) => {
  const result = await TransactionLogService.getAllTransation();

  sendResponse<TransactionLog[]>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Todos logos de reservação listadas',
    data: result,
  });
});
const getAllUsersTransation = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await TransactionLogService.getAllUserTransation(id);

  sendResponse<TransactionLog[]>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Todos logos de reservação listadas',
    data: result,
  });
});

export const TransactionLogController = {
  getAllTransation,
  getAllUsersTransation,
};
