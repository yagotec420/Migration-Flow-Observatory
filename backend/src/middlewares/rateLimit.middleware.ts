import rateLimit from 'express-rate-limit';
import { rateLimitConfig } from '@/config/http.config.js';
import { sendError } from '@/utils/apiResponse.js';
import { HttpStatus } from '@/constants/httpStatus.js';
import { ErrorCode } from '@/constants/errorCodes.js';

export const rateLimiter = rateLimit({
  ...rateLimitConfig,
  handler: (_req, res) => {
    sendError(
      res,
      HttpStatus.TOO_MANY_REQUESTS,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Muitas requisições em um curto período. Tente novamente em instantes.',
    );
  },
});
