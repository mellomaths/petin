import { Address, Profile } from "../../../../application/account/Profile";
import { DatabaseConnection } from "../../../database/DatabaseConnection";
import { Inject } from "../../../di/DependencyInjection";
import { ProfilesRepository } from "./ProfilesRepository";

export class PostgresProfilesRepository implements ProfilesRepository {
  @Inject("Database")
  connection: DatabaseConnection;

  private mapProfile(result: any): Profile {
    return {
      id: result.profile_id,
      accountId: result.account_id,
      fullname: result.fullname,
      documentNumber: result.document_number,
      documentNumberType: result.document_type,
      birthdate: result.birthday,
      bio: result.bio,
      gender: result.gender,
      phoneNumber: result.phone_number,
      addressId: result.address_id,
      address: {
        id: result.address_id,
        street: result.street,
        streetNumber: result.street_number,
        city: result.city,
        state: result.state,
        countryCode: result.country_code,
        zipCode: result.zip_code,
        latitude: result.latitude,
        longitude: result.longitude,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      } as Address,
      avatar: result.avatar,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    } as Profile;
  }

  private async createAddress(profile: Profile): Promise<void> {
    const statement = `INSERT INTO petin.address (address_id, street, street_number, city, state, country_code, zip_code, latitude, longitude, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;
    await this.connection.query(statement, [
      profile.address.id,
      profile.address.street,
      profile.address.streetNumber,
      profile.address.city,
      profile.address.state,
      profile.address.countryCode,
      profile.address.zipCode,
      profile.address.latitude,
      profile.address.longitude,
      profile.address.createdAt,
      profile.address.updatedAt,
    ]);
  }

  async getByAccountId(accountId: string): Promise<Profile | null> {
    const statement = `SELECT * FROM petin.profile as pr JOIN petin.address as add ON pr.address_id = add.address_id WHERE account_id = $1`;
    const result = await this.connection.query(statement, [accountId]);
    if (!result || result.length === 0) {
      return null;
    }
    const profile = result[0];
    return this.mapProfile(profile);
  }

  async create(profile: Profile): Promise<void> {
    await this.createAddress(profile);
    const statement = `INSERT INTO petin.profile (profile_id, account_id, fullname, document_number, document_type, birthdate, bio, gender, phone_number, address_id, avatar, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;
    await this.connection.query(statement, [
      profile.id,
      profile.accountId,
      profile.fullname,
      profile.documentNumber,
      profile.documentNumberType,
      profile.birthdate,
      profile.bio,
      profile.gender,
      profile.phoneNumber,
      profile.address.id,
      profile.avatar,
      profile.createdAt,
      profile.updatedAt,
    ]);
  }
}
