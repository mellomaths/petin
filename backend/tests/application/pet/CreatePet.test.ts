import { Authenticate } from "../../../src/application/account/usecase/Authenticate";
import { Pet } from "../../../src/application/pet/Pet";
import {
  CreatePet,
  CreatePetRepository,
} from "../../../src/application/pet/usecase/CreatePet";

describe("Create Pet", () => {
  let petsRepository: CreatePetRepository;
  let service: CreatePet;
  let pet: Pet;
  let authenticateService: Authenticate;

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
      donation: true,
      adopted: false,
      archived: false,
    };
    authenticateService = {
      accountsRepository: {
        get: jest.fn(),
      },
      tokenGenerator: {
        verify: jest.fn(),
      },
      execute: jest.fn().mockResolvedValue({ id: "account_id" }),
    };
    service = new CreatePet();
    service.petsRepository = petsRepository;
    service.authenticate = authenticateService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a pet", async () => {
    const result = await service.execute("token", pet);
    expect(result).toBeDefined();
    expect(result.petId).toBeDefined();
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
