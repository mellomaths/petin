import { Pet } from "./Pet";
import { Inject } from "../../infra/di/DependencyInjection";
import { PetValidator } from "./PetValidator";

export class CreatePet {
  @Inject("PetsRepository")
  petsRepository: CreatePetRepository;

  async execute(pet: Pet): Promise<{ pet_id: string }> {
    PetValidator.validate(pet);
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
