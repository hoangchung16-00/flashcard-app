import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { errorResponse } from './response.util';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : ((exceptionResponse as { message?: string | string[] }).message ??
            exception.message);

      response
        .status(status)
        .json(
          errorResponse(
            Array.isArray(message) ? message.join(', ') : message,
            status,
          ),
        );
      return;
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(errorResponse(message, HttpStatus.INTERNAL_SERVER_ERROR));
  }
}
