import { Inject } from "../../../infra/di/DependencyInjection";
import { Authenticate } from "../../account/usecase/Authenticate";
import { Pet } from "../Pet";

export class ListPets {
  @Inject("PetsRepository")
  petsRepository: ListPetsRepository;

  @Inject("Authenticate")
  authenticate: Authenticate;

  async execute(
    token: string,
    latitude: number,
    longitude: number,
    radius: number,
    limit: number = 10
  ): Promise<Pet[]> {
    await this.authenticate.execute(token);
    const pets = await this.petsRepository.all();
    if (!pets || pets.length === 0) {
      return [];
    }

    return pets;
  }
}

export interface ListPetsRepository {
  all(): Promise<Pet[]>;
}
