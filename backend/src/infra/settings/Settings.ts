export class Settings {
  private env: EnvironmentVariables = {} as EnvironmentVariables;

  constructor() {
    this.setEnvironmentVariables();
  }

  setEnvironmentVariables(): void {
    this.env.port = parseInt(process.env.PORT as string);
    this.env.database = {
      url: process.env.DATABASE_URL as string,
      name: process.env.DATABASE_NAME as string,
    };
    this.env.objectStorage = {
      endpoint: process.env.OBJECT_STORAGE_ENDPOINT as string,
      port: parseInt(process.env.OBJECT_STORAGE_PORT as string),
      useSSL: process.env.OBJECT_STORAGE_USE_SSL === "true",
      accessKey: process.env.OBJECT_STORAGE_ACCESS_KEY as string,
      secretKey: process.env.OBJECT_STORAGE_SECRET_KEY as string,
    };
    this.env.environment = process.env.ENV as string;
    this.env.jwtSecret = process.env.AUTH_TOKEN_SECRET as string;
    this.env.messageBroker = {
      url: process.env.MESSAGE_BROKER_URL as string,
    };
  }

  getPort(): number {
    return this.env.port;
  }

  getDatabase(): { url: string; name: string } {
    return {
      url: process.env.DATABASE_URL as string,
      name: process.env.DATABASE_NAME as string,
    };
  }

  getEnvironment(): string {
    return this.env.environment;
  }

  getObjectStorage(): ObjectStorage {
    return this.env.objectStorage;
  }

  getJwtSecret(): string {
    return this.env.jwtSecret;
  }

  getMessageBroker(): MessageBroker {
    return this.env.messageBroker;
  }

  isProduction(): boolean {
    return this.env.environment === "production";
  }
}

type Database = {
  url: string;
  name: string;
};

type ObjectStorage = {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
};

type MessageBroker = {
  url: string;
};

type EnvironmentVariables = {
  port: number;
  database: Database;
  environment: string;
  objectStorage: ObjectStorage;
  jwtSecret: string;
  messageBroker: MessageBroker;
};
