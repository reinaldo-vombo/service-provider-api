/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    export interface Request {
      user: JwtPayload;
    }
  }
}
