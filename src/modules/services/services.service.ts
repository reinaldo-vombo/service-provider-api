import ApiError from '../../error/ApiError';
import httpStatus from 'http-status';
import { prisma } from '../../shared/prisma';
import { Service } from '../../generated/prisma';

const createService = async (userId: string | undefined, info: Service) => {
  if (!userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Id do provedor é obrigatorio');
  }
  const { name, description, price } = info;

  try {
    const provider = await prisma.user.findUnique({ where: { id: userId } });
    if (!provider || provider.role !== 'PROVIDER') {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Apenas provedores podem criar serviços.'
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price,
        providerId: userId,
      },
    });

    return service;
  } catch (error: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getAllServices = async () => {
  try {
    const services = await prisma.service.findMany({
      include: { provider: { select: { fullName: true, email: true } } },
    });
    return services;
  } catch (error) {
    console.error(error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Erro ao listar serviços'
    );
  }
};

export const updateService = async (
  serviceId: string,
  userId: string,
  info: Service
) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service)
      throw new ApiError(httpStatus.NOT_FOUND, 'Serviço não encontrado');
    if (service.providerId !== userId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Sem permissão para editar este serviço'
      );
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: info,
    });

    return updated;
  } catch (error) {
    console.error(error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Erro ao atualizar serviço'
    );
  }
};

// ✅ Deletar serviço
export const deleteService = async (serviceId: string, userId: string) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service)
      throw new ApiError(httpStatus.NOT_FOUND, 'Serviço não encontrado');

    if (service.providerId !== userId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Sem permissão para deletar este serviço'
      );
    }

    const services = await prisma.service.delete({ where: { id: serviceId } });
    return service;
  } catch (error) {
    console.error(error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Erro ao deletar serviço'
    );
  }
};

export const Services = {
  createService,
  getAllServices,
  updateService,
  deleteService,
};
