import { registerAs } from '@nestjs/config';

export interface SessionConfig {
  secret: string;
}

export default registerAs('session', () => ({
  secret: process.env.SESSION_SECRET,
}));
