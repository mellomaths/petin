import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.AUTH_JWT_SECRET_KEY,
  expirationTime: parseInt(process.env.AUTH_JWT_EXPIRATION_TIME),
}));
