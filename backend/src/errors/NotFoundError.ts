import { AppError } from '@/errors/AppError.js';
import { ErrorCode } from '@/constants/errorCodes.js';
import { HttpStatus } from '@/constants/httpStatus.js';

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} com identificador "${identifier}" não foi encontrado(a).`
      : `${resource} não foi encontrado(a).`;

    super(message, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
  }
}
