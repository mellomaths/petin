import { Account } from "../../../application/account/Account";
import { Address } from "../../../application/owner/Owner";
import { DatabaseConnection } from "../../database/DatabaseConnection";
import { Inject } from "../../di/DependencyInjection";
import { AccountsRepository } from "./AccountsRepository";

export class PostgresAccountsRepository implements AccountsRepository {
  @Inject("Database")
  connection: DatabaseConnection;

  private mapAccount(result: any): Account {
    const account: Account = {
      id: result.account_id,
      email: result.email,
      password: result.password,
    };
    if (result.owner_id) {
      account.owner = {
        id: result.owner_id,
        accountId: result.account_id,
        fullname: result.fullname,
        documentNumber: result.document_number,
        birthday: result.birthday,
        bio: result.bio,
        gender: result.gender,
        phoneNumber: result.phone_number,
        addressId: result.address_id,
        address: {} as Address,
      };
    }
    return account;
  }

  async get(accountId: string): Promise<Account | null> {
    const query =
      "SELECT acct.account_id, acct.email, acct.password, acct.created_at, acct.updated_at, ow.owner_id, ow.fullname, ow.document_number, ow.birthday, ow.bio, ow.gender, ow.phone_number, ow.address_id, ow.avatar FROM petin.account as acct LEFT JOIN petin.owner as ow ON acct.account_id = ow.account_id WHERE acct.account_id = $1";
    let result = await this.connection.query(query, [accountId]);
    if (!result || result.length === 0) {
      return null;
    }
    return this.mapAccount(result[0]);
  }

  async getByEmail(email: string): Promise<Account | null> {
    const query =
      "SELECT acct.account_id, acct.email, acct.password, acct.created_at, acct.updated_at, ow.owner_id, ow.fullname, ow.document_number, ow.birthday, ow.bio, ow.gender, ow.phone_number, ow.address_id, ow.avatar FROM petin.account as acct LEFT JOIN petin.owner as ow ON acct.account_id = ow.account_id WHERE acct.email = $1";
    let result = await this.connection.query(query, [email]);
    if (!result || result.length === 0) {
      return null;
    }
    return this.mapAccount(result[0]);
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
