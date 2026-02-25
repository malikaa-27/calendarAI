import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error('unhandled_error', { message: err?.message, stack: err?.stack });
  res.status(err?.status || 500).json({ error: err?.message || 'Internal server error' });
}
