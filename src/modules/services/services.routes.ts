import express from 'express';
import { ServicesController } from './services.controller';
import authGuard from '../../middlewares/authGuard';
import validateRequest from '../../middlewares/validateRequest';
import { ENUM_USER_ROLE } from '../../enums/user';
import {
  createServiceZodSchema,
  updateServiceZodSchema,
} from './services.validation';

const router = express.Router();

// Criar reserva
router.post(
  '/',
  authGuard(ENUM_USER_ROLE.PROVIDER),
  validateRequest(createServiceZodSchema),
  ServicesController.createService
);
router.get('/', ServicesController.getAllServices);

router.patch(
  '/:id',
  authGuard(ENUM_USER_ROLE.PROVIDER),
  validateRequest(updateServiceZodSchema),
  ServicesController.updateServices
);

router.delete(
  '/:id',
  authGuard(ENUM_USER_ROLE.PROVIDER, ENUM_USER_ROLE.CLIENT),
  ServicesController.deleteServices
);

export const ServicesRoutes = router;
