/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Prisma } from '@prisma/client';
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import config from '../config';
import { IGenericErrorMessage } from '../interfaces/common';
import sendResponse from '../shared/sendResponse';
import ApiError from './ApiError';
import {
  handlePrismaRequestError,
  handlePrismaValidationError,
} from './handlePrismaError';
import handleZodError from './handleZodError';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

// Global Error Handler
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong!';
  let errorMessages: IGenericErrorMessage[] = [];

  if (err?.name === 'ValidationError') {
  } else if (err instanceof PrismaClientValidationError) {
    const simplified = handlePrismaValidationError(err);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorMessages = simplified.errorMessages;
  } else if (err instanceof ZodError) {
    const simplified = handleZodError(err);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorMessages = simplified.errorMessages;
  } else if (err?.name === 'CastError') {
  } else if (err instanceof PrismaClientKnownRequestError) {
    const simplified = handlePrismaRequestError(err);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorMessages = simplified.errorMessages;
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    errorMessages = [
      {
        path: Object.keys(err.keyValue)[0],
        message: 'Duplicate field value entered',
      },
    ];
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorMessages = err?.message
      ? [
          {
            path: '',
            message: err?.message,
          },
        ]
      : [];
  } else if (err instanceof Error) {
    message = err.message;
    errorMessages = err?.message
      ? [
          {
            path: '',
            message: err?.message,
          },
        ]
      : [];
  }

  sendResponse(res, {
    statusCode,
    success: false,
    message,
    errorMessages,
    stack: config.isDevelopment ? err.stack : undefined,
  });
};

export default globalErrorHandler;
