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
      owner_id: result.owner_id,
      name: result.name,
      birthday: result.birthday,
      bio: result.bio,
      sex: result.sex,
      type: result.type,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
    return pet;
  }

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

  async searchWithinRadius(
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<Pet[]> {
    const statement = `SELECT * FROM petin.pet WHERE ST_Distance_Sphere(ST_MakePoint(longitude, latitude),ST_MakePoint($1, $2)) < $3`;
    const result = await this.connection.query(statement, [
      longitude,
      latitude,
      radius,
    ]);
    if (!result || result.length === 0) {
      return [];
    }

    return result.map((row: any) => this.mapPet(row));
  }
}
