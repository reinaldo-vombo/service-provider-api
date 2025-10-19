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

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Cria uma nova reserva
 *     description: Permite que um cliente crie uma reserva para um serviço.
 *     tags: [Reservas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reserva criada com sucesso
 *       400:
 *         description: Não podes reservar o próprio serviço
 *
 */
// Criar reserva
router.post(
  '/',
  authGuard(ENUM_USER_ROLE.CLIENT),
  validateRequest(createReservationZodSchema),
  ReservationController.createReservation
);

/**
 * @swagger
 * /reservations/{id}/cancel:
 *   patch:
 *     summary: Cancela uma reserva
 *     description: Permite que o cliente ou provedor cancele uma reserva existente.
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da reserva a ser cancelada
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva cancelada com sucesso
 *       404:
 *         description: Reserva não encontrada
 */
// Cancelar reserva
router.patch(
  '/:id/cancel',
  authGuard(ENUM_USER_ROLE.PROVIDER, ENUM_USER_ROLE.CLIENT),
  validateRequest(cancelReservationZodSchema),
  ReservationController.cancelReservation
);

/**
 * @swagger
 * /reservations/{id}/cancel:
 *   patch:
 *     summary: Cancela uma reserva
 *     description: Permite que o cliente ou provedor cancele uma reserva existente.
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da reserva a ser atualizado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva atualizado com sucesso
 *       404:
 *         description: Reserva não encontrada
 *       403:
 *         description: Sem permissão para atualizar
 */
router.put(
  '/:id',
  authGuard(ENUM_USER_ROLE.PROVIDER),
  validateRequest(cancelReservationZodSchema),
  ReservationController.updateReservation
);

/**
 * @swagger
 * /reservations/{id}/cancel:
 *   patch:
 *     summary: Eliminar uma reserva
 *     description: Permite que o provedor elimine uma reserva existente.
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da reserva a ser eliminado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva atualizado com sucesso
 *       404:
 *         description: Reserva não encontrada
 *       403:
 *         description: Sem permissão para eliminar
 */
router.delete(
  '/:id',
  authGuard(ENUM_USER_ROLE.CLIENT),
  ReservationController.deleteReservation
);

export const ReservationRoutes = router;
