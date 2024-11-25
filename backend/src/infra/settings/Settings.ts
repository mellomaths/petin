export class Settings {
  readonly port: number;
  readonly database: { url: string; name: string };
  readonly environment: string;
  readonly objectStorage: {
    endpoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
  };

  constructor() {
    this.port = parseInt(process.env.PORT as string);
    this.database = {
      url: process.env.DATABASE_URL as string,
      name: process.env.DATABASE_NAME as string,
    };
    this.objectStorage = {
      endpoint: process.env.OBJECT_STORAGE_ENDPOINT as string,
      port: parseInt(process.env.OBJECT_STORAGE_PORT as string),
      useSSL: process.env.OBJECT_STORAGE_USE_SSL === "true",
      accessKey: process.env.OBJECT_STORAGE_ACCESS_KEY as string,
      secretKey: process.env.OBJECT_STORAGE_SECRET_KEY as string,
    };
    this.environment = process.env.ENV as string;
  }

  isProduction(): boolean {
    return this.environment === "production";
  }
}
