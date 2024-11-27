import { Pet } from "../../../application/pet/Pet";
import { DatabaseConnection } from "../../database/DatabaseConnection";
import { Inject } from "../../di/DependencyInjection";
import { PetsRepository } from "./PetsRepository";

export class PostgresPetsRepository implements PetsRepository {
  @Inject("Database")
  connection: DatabaseConnection;

  async create(pet: Pet): Promise<void> {
    const statement = `INSERT INTO petin.pet (pet_id, owner_id, name, birthday, bio, sex, type, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    this.connection.query(statement, [
      pet.id,
      pet.owner_id,
      pet.name,
      pet.birthday,
      pet.bio,
      pet.sex,
      pet.type,
      pet.createdAt,
      pet.updatedAt,
    ]);
  }
}
