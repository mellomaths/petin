import { Pet } from "../../../src/application/pet/Pet";
import { ListPets } from "../../../src/application/pet/usecase/ListPets";
import { generateFakePet } from "../../helpers/Fake";
import { mockAuthenticate } from "../../helpers/Mock";

describe("ListPets", () => {
  let service: ListPets;
  let pets: Pet[];

  beforeEach(() => {
    service = new ListPets();
    service.petsRepository = {
      all: jest.fn(),
    };
    service.authenticate = mockAuthenticate();
    pets = [
      generateFakePet("DOG"),
      generateFakePet("CAT"),
      generateFakePet("DOG"),
    ];
  });

  it("should list pets", async () => {
    const pet1 = generateFakePet("DOG");
    pet1.id = "pet1";
    pet1.ownerAccountProfile!.address.latitude = -22.9505541;
    pet1.ownerAccountProfile!.address.longitude = -43.1822991;
    pets.push(pet1);
    service.petsRepository.all = jest.fn().mockResolvedValue(pets);

    const latitude = -22.9888419;
    const longitude = -43.1923842;
    const radius = 10.0;
    const petsInRegion = await service.execute(
      "token",
      latitude,
      longitude,
      radius
    );
    expect(petsInRegion.length).toEqual(1);
    expect(petsInRegion[0].id).toEqual("pet1");
  });

  it("should return empty list when no pets are found", async () => {
    service.petsRepository.all = jest.fn().mockResolvedValue([]);

    const latitude = 1.0;
    const longitude = 1.0;
    const radius = 1.0;
    const pets = await service.execute("token", latitude, longitude, radius);
    expect(pets).toEqual([]);
  });

  it("should validate location", async () => {
    await expect(
      service.execute("token", 0.0, -43.1923842, 10.0)
    ).rejects.toThrow("Invalid location");

    await expect(
      service.execute("token", -22.9888419, 0.0, 10.0)
    ).rejects.toThrow("Invalid location");

    await expect(
      service.execute("token", -22.9888419, -43.1923842, 0.0)
    ).rejects.toThrow("Invalid location");
  });

  it("should filter out pets not available for donation", async () => {
    const pet = generateFakePet("DOG");
    pet.id = "test_pet";
    pet.donation = false;
    pet.ownerAccountProfile!.address.latitude = -22.9505541;
    pet.ownerAccountProfile!.address.longitude = -43.1822991;
    pets.push(pet);

    service.petsRepository.all = jest.fn().mockResolvedValue(pets);

    const latitude = -22.9888419;
    const longitude = -43.1923842;
    const radius = 10.0;
    const petsInRegion = await service.execute(
      "token",
      latitude,
      longitude,
      radius
    );
    expect(petsInRegion.find((pet) => pet.id === "test_pet")).toBeUndefined();
  });

  it("should filter out already adopted pets", async () => {
    const pet = generateFakePet("DOG");
    pet.id = "test_pet";
    pet.adopted = true;
    pet.ownerAccountProfile!.address.latitude = -22.9505541;
    pet.ownerAccountProfile!.address.longitude = -43.1822991;
    pets.push(pet);

    service.petsRepository.all = jest.fn().mockResolvedValue(pets);

    const latitude = -22.9888419;
    const longitude = -43.1923842;
    const radius = 10.0;
    const petsInRegion = await service.execute(
      "token",
      latitude,
      longitude,
      radius
    );
    expect(petsInRegion.find((pet) => pet.id === "test_pet")).toBeUndefined();
  });

  it("should filter out archived pets", async () => {
    const pet = generateFakePet("DOG");
    pet.id = "test_pet";
    pet.archived = true;
    pet.ownerAccountProfile!.address.latitude = -22.9505541;
    pet.ownerAccountProfile!.address.longitude = -43.1822991;
    pets.push(pet);

    service.petsRepository.all = jest.fn().mockResolvedValue(pets);

    const latitude = -22.9888419;
    const longitude = -43.1923842;
    const radius = 10.0;
    const petsInRegion = await service.execute(
      "token",
      latitude,
      longitude,
      radius
    );
    expect(petsInRegion.find((pet) => pet.id === "test_pet")).toBeUndefined();
  });
});
