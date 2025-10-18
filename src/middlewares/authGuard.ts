import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { verifyToken } from '../helpers/jwtHelpers';
import config from '../config';
import ApiError from '../error/ApiError';

const authGuard =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader;

      const verifiedToken = verifyToken(token, config.JWT_SECRET);

      // Check if user has required roles
      if (requiredRoles.length && !requiredRoles.includes(verifiedToken.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "You don't have permission to access this resource"
        );
      }

      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };

export default authGuard;
