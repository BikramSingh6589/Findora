import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: any,
  message = 'Success',
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 500,
  details: any = null
): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
    ...(details && { details }),
  });
};
