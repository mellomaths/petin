import { registerAs } from '@nestjs/config';

export interface ServerConfig {
  env: string;
  port: number;
}

export default registerAs('server', () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3000,
}));
