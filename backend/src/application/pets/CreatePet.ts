import { isDate, isDateString, isEnum } from "class-validator";
import { Animal, Pet, Sex } from "./Pet";
import { ApplicationException } from "../../infra/exception/ApplicationException";
import { Inject } from "../../infra/di/DependencyInjection";

export class CreatePet {
  @Inject("PetsRepository")
  petsRepository: CreatePetRepository;

  constructor() {}

  private validate(pet: Pet): void {
    if (!pet.name) {
      throw new ApplicationException(
        400,
        { message: "Name is required" },
        "Name is required"
      );
    }
    if (!pet.birthday) {
      throw new ApplicationException(
        400,
        { message: "Birthday is required" },
        "Birthday is required"
      );
    }
    if (!isDateString(pet.birthday) && !isDate(new Date(pet.birthday))) {
      throw new ApplicationException(
        400,
        { message: "Birthday must be a valid date" },
        "Birthday must be a valid date"
      );
    }
    if (!pet.bio) {
      throw new ApplicationException(
        400,
        { message: "Bio is required" },
        "Bio is required"
      );
    }
    if (!isEnum(pet.type, Animal)) {
      throw new ApplicationException(
        400,
        { message: "Invalid type" },
        "Invalid type"
      );
    }
    if (!isEnum(pet.sex, Sex)) {
      throw new ApplicationException(
        400,
        { message: "Invalid sex" },
        "Invalid sex"
      );
    }
    if (new Date(pet.birthday) > new Date()) {
      throw new ApplicationException(
        400,
        { message: "Birthday must be in the past" },
        "Birthday must be in the past"
      );
    }
  }

  async execute(pet: Pet): Promise<{ pet_id: string }> {
    this.validate(pet);
    pet.id = crypto.randomUUID();
    pet.createdAt = new Date().toISOString();
    pet.updatedAt = new Date().toISOString();
    pet.birthday = new Date(pet.birthday).toISOString();

    await this.petsRepository.save(pet);
    return { pet_id: pet.id };
  }
}

export interface CreatePetRepository {
  save(pet: Pet): Promise<void>;
}
