import { Pet } from "../../../src/application/pet/Pet";
import { CreatePet } from "../../../src/application/pet/usecase/CreatePet";
import { ApplicationException } from "../../../src/infra/exception/ApplicationException";

describe("Create Pet", () => {
  let service: CreatePet;
  let pet: Pet;

  beforeEach(() => {
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
    service = new CreatePet();
    service.petsRepository = {
      create: jest.fn(),
    };
    service.authenticate = {
      accountsRepository: {
        get: jest.fn(),
      },
      tokenGenerator: {
        verify: jest.fn(),
        decode: jest.fn(),
      },
      execute: jest.fn().mockResolvedValue({ id: "account_id" }),
    };
    service.profilesRepository = {
      getByAccountId: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a pet", async () => {
    service.profilesRepository.getByAccountId = jest.fn().mockResolvedValue({
      id: "profile_id",
    });
    const result = await service.execute("token", pet);
    expect(result).toBeDefined();
    expect(result.petId).toBeDefined();
    expect(pet.createdAt).toBeDefined();
    expect(service.petsRepository.create).toHaveBeenCalledTimes(1);
    expect(service.petsRepository.create).toHaveBeenCalledWith({
      ...pet,
      id: pet.id,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      birthday: expect.any(String),
    });
  });

  it("should throw an error if the profile is not found", async () => {
    service.profilesRepository.getByAccountId = jest
      .fn()
      .mockResolvedValue(null);
    await expect(service.execute("token", pet)).rejects.toThrow(
      new ApplicationException(
        404,
        { message: "Profile not registered" },
        "Profile not registered"
      )
    );
  });
});
