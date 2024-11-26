import { Account } from "../../../application/account/Account";
import { DatabaseConnection } from "../../database/DatabaseConnection";
import { Inject } from "../../di/DependencyInjection";
import { AccountsRepository } from "./AccountsRepository";

export class PostgresAccountsRepository implements AccountsRepository {
  @Inject("Database")
  connection: DatabaseConnection;

  async getByEmail(email: string): Promise<Account | null> {
    const query = "SELECT * FROM petin.account WHERE email = $1";
    const result = await this.connection.query(query, [email]);
    if (!result || result.length === 0) {
      return null;
    }
    const account = result[0];
    return {
      id: account.id,
      email: account.email,
      password: account.password,
    };
  }
  async create(account: Account): Promise<void> {
    const query =
      "INSERT INTO petin.account (account_id, email, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)";
    await this.connection.query(query, [
      account.id,
      account.email,
      account.password,
      account.createdAt,
      account.updatedAt,
    ]);
  }
}
