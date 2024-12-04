import { Inject } from "../../../infra/di/DependencyInjection";
import { Authenticate } from "../../account/usecase/Authenticate";
import { Pet } from "../Pet";
import { PetValidator } from "../validator/PetValidator";

export class CreatePet {
  @Inject("PetsRepository")
  petsRepository: CreatePetRepository;

  @Inject("Authenticate")
  authenticate: Authenticate;

  async execute(token: string, pet: Pet): Promise<{ petId: string }> {
    const account = await this.authenticate.execute(token);
    pet.ownerAccountId = account.id;

    // TODO: Validate if Account has a Profile
    PetValidator.validate(pet);
    pet.id = crypto.randomUUID();
    pet.createdAt = new Date().toISOString();
    pet.updatedAt = new Date().toISOString();
    pet.birthday = new Date(pet.birthday).toISOString();

    await this.petsRepository.create(pet);
    return { petId: pet.id };
  }
}

export interface CreatePetRepository {
  create(pet: Pet): Promise<void>;
}
