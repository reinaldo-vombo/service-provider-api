import asyncHandler from '../../shared/asyncHandler';
import httpStatus from 'http-status';
import { ReservationService } from './reservation.service';
import sendResponse from '../../shared/sendResponse';
import { Reservation } from '../../generated/prisma';

const createReservation = asyncHandler(async (req, res) => {
  const clientId = req.user?.sub;
  const { serviceId } = req.body;
  const result = await ReservationService.createReservation(
    clientId,
    serviceId
  );

  sendResponse<Reservation>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Reservação feita com sucesso',
    data: result,
  });
});
const cancelReservation = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const reservationId = req.params.id;
  const result = await ReservationService.cancelReservation({
    reservationId,
    userId,
  });

  sendResponse<Reservation>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Reserva cancelada com sucesso',
    data: result,
  });
});
const updateReservation = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const reservationId = req.params.id;
  const data = req.body;
  const result = await ReservationService.updateReservation({
    reservationId,
    userId,
    data,
  });

  sendResponse<Reservation>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Reserva autoalizada com sucesso',
    data: result,
  });
});
const deleteReservation = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id;
  const result = await ReservationService.deleteReservation(id, userId);

  sendResponse<Reservation>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Reserva cancelada e removida com sucesso',
    data: result,
  });
});

export const ReservationController = {
  createReservation,
  cancelReservation,
  updateReservation,
  deleteReservation,
};
