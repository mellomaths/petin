import { Inject } from "../../../infra/di/DependencyInjection";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { Profile } from "../../account/Profile";
import { Authenticate } from "../../account/usecase/Authenticate";
import { CreateNewId } from "../../id/usecase/CreateNewId";
import { Pet } from "../Pet";
import { PetValidator } from "../validator/PetValidator";

export class CreatePet {
  @Inject("PetsRepository")
  petsRepository: CreatePetRepository;

  @Inject("ProfilesRepository")
  profilesRepository: CreatePetProfilesRepository;

  @Inject("Authenticate")
  authenticate: Authenticate;

  @Inject("CreateNewId")
  createNewId: CreateNewId;

  async execute(token: string, pet: Pet): Promise<{ petId: string }> {
    const account = await this.authenticate.execute(token);
    pet.ownerAccountId = account.id;

    const profile = await this.profilesRepository.getByAccountId(account.id!);
    if (!profile) {
      throw new ApplicationException(
        404,
        { message: "Profile not registered" },
        "Profile not registered"
      );
    }

    PetValidator.validate(pet);
    pet.id = await this.createNewId.execute();
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

export interface CreatePetProfilesRepository {
  getByAccountId(accountId: string): Promise<Profile | null>;
}
