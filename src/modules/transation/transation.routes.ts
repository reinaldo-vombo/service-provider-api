import express from 'express';
import { TransactionLogController } from './transation.controller';
import authGuard from '../../middlewares/authGuard';
import { ENUM_USER_ROLE } from '../../enums/user';

const router = express.Router();

// Criar reserva
router.get(
  '/',
  authGuard(ENUM_USER_ROLE.ADMIN),
  TransactionLogController.getAllTransation
);
router.get(
  '/:id',
  authGuard(ENUM_USER_ROLE.CLIENT),
  TransactionLogController.getAllUsersTransation
);

export const TransactionLogRoutes = router;
