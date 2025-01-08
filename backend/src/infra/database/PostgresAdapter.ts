import pgp from "pg-promise";
import { DatabaseConnection } from "./DatabaseConnection";
import { Inject } from "../di/DependencyInjection";
import { Settings } from "../settings/Settings";

export class PostgresAdapter implements DatabaseConnection {
  @Inject("Settings")
  settings: Settings;

  connection: any;

  constructor() {
    this.connection = pgp()(this.settings.getDatabase().url);
  }

  async connect(): Promise<void> {
    await this.connection.connect();
  }

  getConnection(): any {
    return this.connection;
  }

  query(statement: string, params: any): Promise<any> {
    return this.connection?.query(statement, params);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.connection?.query("SELECT 1");
      return true;
    } catch (error) {
      return false;
    }
  }

  async close(): Promise<void> {
    await this.connection?.$pool.end();
  }
}
