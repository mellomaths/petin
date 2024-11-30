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

    // TODO: Implement the logic to filter pets by location and radius
    // * For now, we are just returning all pets

    return pets;
  }
}

export interface ListPetsRepository {
  all(): Promise<Pet[]>;
}
