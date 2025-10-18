import express from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createUserZodSchema, logInZodSchema } from './auth.validation';

const router = express.Router();

// Criar reserva
router.post(
  '/register',
  validateRequest(createUserZodSchema),
  AuthController.register
);
router.post('/login', validateRequest(logInZodSchema), AuthController.login);

// Cancelar reserva

export const AuthRoutes = router;
