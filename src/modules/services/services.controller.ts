import httpStatus from 'http-status';
import asyncHandler from '../../shared/asyncHandler';
import { Services } from './services.service';
import sendResponse from '../../shared/sendResponse';
import { Service } from '../../generated/prisma';

const createService = asyncHandler(async (req, res) => {
  const userId = req.user?.sub;

  const result = await Services.createService(userId, req.body);

  sendResponse<Service>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Serviço criado',
    data: result,
  });
});
const getAllServices = asyncHandler(async (req, res) => {
  const result = await Services.getAllServices();

  sendResponse<Service[]>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Serviços listados',
    data: result,
  });
});
const updateServices = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const result = await Services.updateService(id, userId, req.body);

  sendResponse<Service>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Serviços atualizado',
    data: result,
  });
});
const deleteServices = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const result = await Services.deleteService(id, userId);

  sendResponse<Service>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Serviços eliminado',
    data: result,
  });
});

export const ServicesController = {
  createService,
  getAllServices,
  updateServices,
  deleteServices,
};
