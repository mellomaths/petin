import {
  CreatePet,
  CreatePetRepository,
} from "../../../src/application/pets/CreatePet";
import { Pet } from "../../../src/application/pets/Pet";
import { ApplicationException } from "../../../src/infra/exception/ApplicationException";

describe("Create Pet", () => {
  let petsRepository: CreatePetRepository;
  let service: CreatePet;
  let pet: Pet;

  beforeEach(() => {
    petsRepository = {
      create: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a pet", async () => {
    const result = await service.execute(pet);
    expect(result).toBeDefined();
    expect(pet.id).toBeDefined();
    expect(pet.createdAt).toBeDefined();
    expect(petsRepository.create).toHaveBeenCalledTimes(1);
    expect(petsRepository.create).toHaveBeenCalledWith({
      ...pet,
      id: pet.id,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      birthday: expect.any(String),
    });
  });
});
