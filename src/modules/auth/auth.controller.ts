import asyncHandler from '../../shared/asyncHandler';
import httpStatus from 'http-status';
import sendResponse from '../../shared/sendResponse';
import { AuthService } from './auth.service';
import { User } from '../../generated/prisma';

const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body);

  sendResponse<User>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Cadastro concluido',
    data: result,
  });
});
const login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Cadastro concluido',
    data: result,
  });
});

export const AuthController = {
  register,
  login,
};
