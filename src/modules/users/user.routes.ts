import express from 'express';
import { UserController } from './user.controller';
import authGuard from '../../middlewares/authGuard';
import { ENUM_USER_ROLE } from '../../enums/user';

const router = express.Router();

// Criar reserva
router.get('/', authGuard(ENUM_USER_ROLE.ADMIN), UserController.getAllUsers);
router.get('/:id', authGuard(ENUM_USER_ROLE.ADMIN), UserController.getUserById);
router.put('/:id', authGuard(ENUM_USER_ROLE.ADMIN), UserController.updateUser);
router.post(
  '/balance',
  authGuard(ENUM_USER_ROLE.ADMIN),
  UserController.updateUserBalance
);

export const UsersRoutes = router;
