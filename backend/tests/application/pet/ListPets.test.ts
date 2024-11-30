import { faker } from "@faker-js/faker/.";
import { ListPets } from "../../../src/application/pet/usecase/ListPets";
import { generateFakePet } from "../../helpers/Fake";

describe("ListPets", () => {
  let service: ListPets;

  beforeEach(() => {
    service = new ListPets();
    service.petsRepository = {
      all: jest.fn(),
    };
    service.authenticate = {
      accountsRepository: {
        get: jest.fn(),
      },
      tokenGenerator: {
        verify: jest.fn(),
      },
      execute: jest.fn().mockResolvedValue({ owner: { id: "owner_id" } }),
    };
  });

  it("should list pets", async () => {
    service.petsRepository.all = jest
      .fn()
      .mockResolvedValue([
        generateFakePet("DOG"),
        generateFakePet("CAT"),
        generateFakePet("DOG"),
      ]);

    const latitude = 1.0;
    const longitude = 1.0;
    const radius = 1.0;
    const pets = await service.execute("token", latitude, longitude, radius);
    // TODO: Implement tests for the filtering logic
    expect(pets.length).toEqual(3);
  });

  it("should return empty list when no pets are found", async () => {
    service.petsRepository.all = jest.fn().mockResolvedValue([]);

    const latitude = 1.0;
    const longitude = 1.0;
    const radius = 1.0;
    const pets = await service.execute("token", latitude, longitude, radius);
    expect(pets).toEqual([]);
  });
});
