import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import config from '../config';

export const verifyToken = (
  token: string,
  secret: Secret = config.JWT_SECRET
): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};
