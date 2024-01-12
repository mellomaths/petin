declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT: number;
      DATABASE_HOST: string;
      DATABASE_PORT: number;
      DATABASE_USERNAME: string;
      DATABASE_PASSWORD: string;
      DATABASE_NAME: string;
      AUTH_JWT_SECRET_KEY: string;
      AUTH_JWT_EXPIRATION_TIME: string;
    }
  }
}

export {};
