import { Address } from "../../../application/account/Profile";
import { Pet } from "../../../application/pet/Pet";
import { DatabaseConnection } from "../../database/DatabaseConnection";
import { Inject } from "../../di/DependencyInjection";
import { PetsRepository } from "./PetsRepository";

export class PostgresPetsRepository implements PetsRepository {
  @Inject("Database")
  connection: DatabaseConnection;

  private mapPet(result: any): Pet {
    const pet: Pet = {
      id: result.pet_id,
      ownerAccountId: result.owner_account_id,
      name: result.name,
      birthday: result.birthday,
      bio: result.bio,
      sex: result.sex,
      type: result.type,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      ownerAccountProfile: {
        id: result.profile_id,
        accountId: result.account_id,
        addressId: result.address_id,
        fullname: result.fullname,
        documentNumber: result.document,
        birthdate: result.birthdate,
        bio: result.bio,
        gender: result.gender,
        phoneNumber: result.phone_number,
        avatar: result.avatar,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        address: {
          id: result.address_id,
          profileId: result.profile_id,
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
        },
      },
    };
    return pet;
  }

  async create(pet: Pet): Promise<void> {
    const statement = `INSERT INTO petin.pet (pet_id, owner_account_id, name, birthday, bio, sex, type, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    this.connection.query(statement, [
      pet.id,
      pet.ownerAccountId,
      pet.name,
      pet.birthday,
      pet.bio,
      pet.sex,
      pet.type,
      pet.createdAt,
      pet.updatedAt,
    ]);
  }

  async all(): Promise<Pet[]> {
    const statement = `
      SELECT *
      FROM petin.pet as pet 
      JOIN petin.profile prfl ON prfl.account_id = pet.owner_account_id
      JOIN petin.address as addr ON prfl.address_id = addr.address_id;`;
    const result = await this.connection.query(statement, []);
    if (!result || result.length === 0) {
      return [];
    }

    return result.map((row: any) => this.mapPet(row));
  }
}
