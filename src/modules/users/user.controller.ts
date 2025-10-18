import asyncHandler from '../../shared/asyncHandler';
import httpStatus from 'http-status';
import sendResponse from '../../shared/sendResponse';
import { UsersServices } from './user.service';

const getAllUsers = asyncHandler(async (req, res) => {
  const result = await UsersServices.getAllUsers();

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Todos os utilizadores listadas',
    data: result,
  });
});
const getUserById = asyncHandler(async (req, res) => {
  const id = req.params.is;
  const result = await UsersServices.getUserById(id);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Utilizadores listado',
    data: result,
  });
});
const deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.is;
  const result = await UsersServices.deleteUser(id);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Utilizadores eliminado',
    data: result,
  });
});
const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.is;
  const result = await UsersServices.updateUser(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Utilizadores atualizado',
    data: result,
  });
});
const updateUserBalance = asyncHandler(async (req, res) => {
  const id = req.params.is;
  const { amount } = req.body;
  const result = await UsersServices.updateUserBalance(id, amount);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Credito atualizado',
    data: result,
  });
});

export const UserController = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserBalance,
  deleteUser,
};
