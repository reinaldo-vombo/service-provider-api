import express from 'express';
import { ReservationController } from '../reservation/reservation.controller';
import authGuard from '../../middlewares/authGuard';
import validateRequest from '../../middlewares/validateRequest';
import { ENUM_USER_ROLE } from '../../enums/user';
import {
  cancelReservationZodSchema,
  createReservationZodSchema,
} from './reservation.validation';

const router = express.Router();

// Criar reserva
router.post(
  '/',
  authGuard(ENUM_USER_ROLE.CLIENT),
  validateRequest(createReservationZodSchema),
  ReservationController.createReservation
);

// Cancelar reserva
router.patch(
  '/:id/cancel',
  authGuard(ENUM_USER_ROLE.PROVIDER, ENUM_USER_ROLE.CLIENT),
  validateRequest(cancelReservationZodSchema),
  ReservationController.cancelReservation
);
router.patch(
  '/:id',
  authGuard(ENUM_USER_ROLE.PROVIDER),
  validateRequest(cancelReservationZodSchema),
  ReservationController.updateReservation
);
router.delete(
  '/:id',
  authGuard(ENUM_USER_ROLE.CLIENT),
  ReservationController.deleteReservation
);

export const ReservationRoutes = router;
