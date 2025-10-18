import { ZodError } from 'zod';
import {
  IGenericErrorMessage,
  IGenericErrorResponse,
} from '../interfaces/common';

const handleZodError = (error: ZodError): IGenericErrorResponse => {
  const errors: IGenericErrorMessage[] = error.issues.map((issue: any) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    };
  });

  const statusCode = 400;

  return {
    statusCode,
    message: 'Invalid Input data',
    errorMessages: errors,
  };
};

export default handleZodError;
