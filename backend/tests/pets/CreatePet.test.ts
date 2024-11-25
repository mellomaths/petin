import {
  CreatePet,
  CreatePetRepository,
} from "../../src/application/pets/CreatePet";
import { Pet } from "../../src/application/pets/Pet";
import { ApplicationException } from "../../src/infra/exception/ApplicationException";

describe("Create Pet", () => {
  let petsRepository: CreatePetRepository;
  let service: CreatePet;
  let pet: Pet;

  beforeEach(() => {
    petsRepository = {
      save: jest.fn(),
    };
    pet = {
      name: "Rex",
      birthday: "2020-01-01",
      bio: "A cute dog",
      sex: "MALE",
      type: "DOG",
    };
    service = new CreatePet();
    service.petsRepository = petsRepository;
  });

  it("should create a pet", async () => {
    const result = await service.execute(pet);
    expect(result).toBeDefined();
    expect(pet.id).toBeDefined();
    expect(pet.createdAt).toBeDefined();
    expect(petsRepository.save).toHaveBeenCalledTimes(1);
    expect(petsRepository.save).toHaveBeenCalledWith({
      ...pet,
      id: pet.id,
      createdAt: pet.createdAt,
    });
  });

  it("should throw an error if name is missing", async () => {
    pet.name = "";
    await expect(service.execute(pet)).rejects.toThrow(
      new ApplicationException(
        400,
        { message: "Name is required" },
        "Name is required"
      )
    );
  });

  it("should throw an error if birthday is missing", async () => {
    pet.birthday = "";
    await expect(service.execute(pet)).rejects.toThrow(
      new ApplicationException(
        400,
        { message: "Birthday is required" },
        "Birthday is required"
      )
    );
  });

  it("should throw an error if birthday is not a valid date", async () => {
    pet.birthday = "invalid-date";
    await expect(service.execute(pet)).rejects.toThrow(
      new ApplicationException(
        400,
        { message: "Birthday must be a valid date" },
        "Birthday must be a valid date"
      )
    );
  });

  it("should throw an error if birthday is in the future", async () => {
    pet.birthday = "3000-01-01";
    await expect(service.execute(pet)).rejects.toThrow(
      new ApplicationException(
        400,
        { message: "Birthday must be in the past" },
        "Birthday must be in the past"
      )
    );
  });

  it("should throw an error if bio is missing", async () => {
    pet.bio = "";
    await expect(service.execute(pet)).rejects.toThrow(
      new ApplicationException(
        400,
        { message: "Bio is required" },
        "Bio is required"
      )
    );
  });

  it("should throw an error if type is invalid", async () => {
    pet.type = "invalid-type";
    await expect(service.execute(pet)).rejects.toThrow(
      new ApplicationException(400, { message: "Invalid type" }, "Invalid type")
    );
  });

  it("should throw an error if sex is invalid", async () => {
    pet.sex = "invalid-sex";
    await expect(service.execute(pet)).rejects.toThrow(
      new ApplicationException(400, { message: "Invalid sex" }, "Invalid sex")
    );
  });
});
