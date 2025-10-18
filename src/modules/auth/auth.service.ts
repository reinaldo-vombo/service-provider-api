import ApiError from '../../error/ApiError';
import httpStatus from 'http-status';
import { prisma } from '../../shared/prisma';
import bcrypt from 'bcryptjs';
import { FLASH_MESSAGE } from '../../helpers/flashMessage';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { User } from '../../generated/prisma';

export const register = async (info: User) => {
  try {
    const { fullName, nif, email, password, role } = info;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { nif }] },
    });
    if (existing)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email ou NIF já em uso');

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        fullName,
        nif,
        email,
        password: hashedPassword,
        role,
      },
    });

    return user;
  } catch (error: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const login = async (info: User) => {
  try {
    const { email, password } = info;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Utilizadore não encontrado verifique as credencias'
      );

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Credenciais inválidas');

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_EXPIRES_IN as any,
      }
    );

    return {
      token,
      user,
    };
  } catch (error: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

export const AuthService = {
  register,
  login,
};
