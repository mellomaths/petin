import { Address, Owner } from "../../../application/owner/Owner";
import { DatabaseConnection } from "../../database/DatabaseConnection";
import { Inject } from "../../di/DependencyInjection";
import { OwnersRepository } from "./OwnersRepository";

export class PostgresOwnersRepository implements OwnersRepository {
  @Inject("Database")
  connection: DatabaseConnection;

  private async createAddress(owner: Owner): Promise<void> {
    const statement = `INSERT INTO petin.address (address_id, street, street_number, city, state, country_code, zip_code, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    await this.connection.query(statement, [
      owner.address.id,
      owner.id,
      owner.address.street,
      owner.address.streetNumber,
      owner.address.city,
      owner.address.state,
      owner.address.countryCode,
      owner.address.zipCode,
      owner.address.createdAt,
      owner.address.updatedAt,
    ]);
  }

  async create(owner: Owner): Promise<void> {
    await this.createAddress(owner);
    const statement = `INSERT INTO petin.owner (owner_id, account_id, fullname, document_number, birthday, bio, gender, phone_number, address_id, avatar, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;
    await this.connection.query(statement, [
      owner.id,
      owner.accountId,
      owner.fullname,
      owner.documentNumber,
      owner.birthday,
      owner.bio,
      owner.gender,
      owner.phoneNumber,
      owner.address.id,
      owner.avatar,
      owner.createdAt,
      owner.updatedAt,
    ]);
  }

  async getByEmail(email: string): Promise<Owner | null> {
    const statement = `SELECT * FROM petin.owner WHERE email = $1`;
    const result = await this.connection.query(statement, [email]);
    if (!result || result.length === 0) {
      return null;
    }
    const owner = result[0];
    return {
      id: owner.owner_id,
      accountId: owner.account_id,
      fullname: owner.fullname,
      documentNumber: owner.document_number,
      birthday: owner.birthday,
      bio: owner.bio,
      gender: owner.gender,
      phoneNumber: owner.phone_number,
      address: {
        id: owner.address_id,
      } as Address,
      avatar: owner.avatar,
      createdAt: owner.created_at,
      updatedAt: owner.updated_at,
    } as Owner;
  }
}
