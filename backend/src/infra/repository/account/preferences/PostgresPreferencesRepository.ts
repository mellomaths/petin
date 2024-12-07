import { Preference } from "../../../../application/account/Preference";
import { DatabaseConnection } from "../../../database/DatabaseConnection";
import { Inject } from "../../../di/DependencyInjection";
import { PreferencesRepository } from "./PreferencesRepository";

export class PostgresPreferencesRepository implements PreferencesRepository {
  @Inject("Database")
  connection: DatabaseConnection;

  async deleteAll(accountId: string): Promise<void> {
    const statement = `DELETE FROM petin.account_preferences WHERE account_id = $1`;
    await this.connection.query(statement, [accountId]);
  }

  async delete(accountId: string, key: string): Promise<void> {
    const statement = `DELETE FROM petin.account_preferences WHERE account_id = $1 AND key = $2`;
    await this.connection.query(statement, [accountId, key]);
  }

  async save(preferences: Preference[]): Promise<void> {
    const statement = `INSERT INTO petin.account_preferences (preferences_id, account_id, key, value, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`;
    for (const preference of preferences) {
      await this.connection.query(statement, [
        preference.id,
        preference.accountId,
        preference.key,
        preference.value,
        preference.createdAt,
        preference.updatedAt,
      ]);
    }
  }
}
