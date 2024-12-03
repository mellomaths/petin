import { Inject } from "../../../infra/di/DependencyInjection";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { Authenticate } from "../../account/usecase/Authenticate";
import { Point } from "../../geolocation/Point";
import { CalculateDistanceBetweenPoints } from "../../geolocation/usecase/CalculateDistanceBetweenPoints";
import { Pet } from "../Pet";

export class ListPets {
  @Inject("PetsRepository")
  petsRepository: ListPetsRepository;

  @Inject("Authenticate")
  authenticate: Authenticate;

  private filterPetsByLocation(
    pets: Pet[],
    latitude: number,
    longitude: number,
    radius: number
  ): Pet[] {
    return pets.filter((pet) => {
      const ownerLatitude = pet.ownerAccountProfile!.address.latitude;
      const ownerLongitude = pet.ownerAccountProfile!.address.longitude;
      const distance = new CalculateDistanceBetweenPoints().execute(
        { latitude, longitude },
        { latitude: ownerLatitude, longitude: ownerLongitude },
        "km"
      );
      return distance <= radius;
    });
  }

  async execute(
    token: string,
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<Pet[]> {
    if (!latitude || !longitude || !radius) {
      throw new ApplicationException(
        400,
        { message: "Invalid location" },
        "Invalid location"
      );
    }

    await this.authenticate.execute(token);
    const pets = await this.petsRepository.all();
    if (!pets || pets.length === 0) {
      return [];
    }

    const filteredPets = this.filterPetsByLocation(
      pets,
      latitude,
      longitude,
      radius
    );

    return filteredPets;
  }
}

export interface ListPetsRepository {
  all(): Promise<Pet[]>;
}
