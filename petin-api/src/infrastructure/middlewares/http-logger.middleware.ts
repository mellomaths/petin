import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MaskFactory } from './masks/mask';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpLoggerMiddleware.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method } = request;
    const userAgent = request.get('user-agent') || '';
    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('Content-Length');
      const message = `${method} ${request.url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`;
      this.logger.log(message);
      const mask = MaskFactory.build(request);
      const body = mask.apply(request);
      this.logger.log(`${method} ${request.url} | ${JSON.stringify(body)}`);
    });

    next();
  }
}
