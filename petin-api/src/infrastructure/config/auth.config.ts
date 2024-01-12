import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  jwt: {
    secretKey: string;
    expirationTime: number;
  };
}

export default registerAs('auth', () => ({
  jwt: {
    secret: process.env.AUTH_JWT_SECRET_KEY,
    expirationTime: parseInt(process.env.AUTH_JWT_EXPIRATION_TIME),
  },
}));
