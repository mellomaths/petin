import { Request } from 'express';
import { Mask, MASK_SYMBOLS } from './mask';

export class RegisterUserMask implements Mask {
  apply(request: Request) {
    const body = request.body;

    if (body.user) {
      if (body.user.password) {
        body.user.password = MASK_SYMBOLS;
      }

      if (body.user.confirmPassword) {
        body.user.confirmPassword = MASK_SYMBOLS;
      }
    }

    return body;
  }
}
