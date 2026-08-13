import { AppError } from '@/errors/AppError.js';
import { ErrorCode } from '@/constants/errorCodes.js';
import { HttpStatus } from '@/constants/httpStatus.js';

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, details);
  }
}
