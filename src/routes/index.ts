import express from 'express';
import { ReservationRoutes } from '../modules/reservation/reservation.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { ServicesRoutes } from '../modules/services/services.routes';
import { TransactionLogRoutes } from '../modules/transation/transation.routes';
import { UsersRoutes } from '../modules/users/user.routes';
const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    routes: AuthRoutes,
  },
  {
    path: '/reservation',
    routes: ReservationRoutes,
  },
  {
    path: '/services',
    routes: ServicesRoutes,
  },
  {
    path: '/transation-logs',
    routes: TransactionLogRoutes,
  },
  {
    path: '/users',
    routes: UsersRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.routes));
export default router;
