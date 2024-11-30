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
    // account.preferences.radius
    // (
    //   ST_DISTANCE (
    //     ST_GEOGPOINT(longitude, latitude),
    //     ST_GEOGPOINT(${longitude}, ${latitude})
    //   ) <= ${radius} * 1000
    // )

    // ST_Distance_Sphere(ST_MakePoint(lng1, lat1),ST_MakePoint(lng2, lat2));
    const pets = await this.petsRepository.searchWithinRadius(
      latitude,
      longitude,
      radius
    );
    if (!pets || pets.length === 0) {
      return [];
    }

    return pets;
  }
}

export interface ListPetsRepository {
  searchWithinRadius(
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<Pet[]>;
}
