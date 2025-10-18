export const handleError = (
  message: string,
  error: any,
  statusCode: number = 500
) => {
  return {
    statusCode,
    message,
    error: error instanceof Error ? error.message : 'Unknown error',
  };
};
