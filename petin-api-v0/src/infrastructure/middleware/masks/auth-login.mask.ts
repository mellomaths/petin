import { Request } from 'express';
import { Mask, MASK_SYMBOLS } from './mask';

export class AuthLoginMask implements Mask {
  apply(request: Request) {
    const body = request.body;

    if (body.password) {
      body.password = MASK_SYMBOLS;
    }

    return body;
  }
}
