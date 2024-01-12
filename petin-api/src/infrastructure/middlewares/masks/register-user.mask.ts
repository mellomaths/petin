import { Request } from 'express';
import { Mask, MASK_SYMBOLS } from './mask';

export class RegisterUserMask implements Mask {
  apply(request: Request) {
    const body = request.body;

    if (body.password) {
      body.password = MASK_SYMBOLS;
    }

    if (body.confirmPassword) {
      body.confirmPassword = MASK_SYMBOLS;
    }

    return body;
  }
}
