import { Request } from 'express';
import { AuthLoginMask } from './auth-login.mask';
import { RegisterUserMask } from './register-user.mask';

export const MASK_SYMBOLS = '******';

export interface Mask {
  apply(request: Request): any;
}

export class NullMask implements Mask {
  apply(request: Request): any {
    return request.body;
  }
}

export class MaskFactory {
  static build(request: Request): Mask {
    if (request) {
      const { method, url } = request;

      if (method === 'POST' && url.match(/\/auth\/login/)) {
        return new AuthLoginMask();
      }

      if (method === 'POST' && url.match(/\/hotels\/.+\/employees/)) {
        return new RegisterUserMask();
      }
    }

    return new NullMask();
  }
}
