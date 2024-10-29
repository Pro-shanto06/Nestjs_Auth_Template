import { HttpException } from '@nestjs/common';

export interface IError {
  status: number;
  errorCode: string;
  message: string;
  data: object;
}

export class ExceptionHelper {
  private static instance: ExceptionHelper;

  static getInstance(): ExceptionHelper {
    if (!ExceptionHelper.instance) {
      ExceptionHelper.instance = new ExceptionHelper();
    }
    return ExceptionHelper.instance;
  }

  defaultError(
    message: string,
    errorCode: string,
    statusCode: number,
    data?: any,
  ): void {
    const error: IError = {
      status: statusCode,
      errorCode: errorCode,
      message: message || '',
      data: data,
    };
    throw new HttpException(error, statusCode);
  }
}
