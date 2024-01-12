import { Request } from 'express';
import { AuthLoginMask } from './auth-login.mask';
import { RegisterUserMask } from './register-user.mask';

export const MASK_SYMBOLS = '******';

export interface Mask {
  apply(request: Request): any;
}

export class NullMask implements Mask {
  apply(request: Request): any {
    if (!request.body) {
      return {};
    }
    return request.body;
  }
}

export class MaskFactory {
  static build(request: Request): Mask {
    if (request) {
      const { method, url } = request;

      if (method === 'POST' && url.match(/\/api\/auth\/login/)) {
        return new AuthLoginMask();
      }

      if (method === 'POST' && url.match(/\/api\/users/)) {
        return new RegisterUserMask();
      }
    }

    return new NullMask();
  }
}
