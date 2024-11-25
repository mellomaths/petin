import {
  CreateOwner,
  CreateOwnerPasswordHasher,
  CreateOwnerRepository,
} from "../../../src/application/owner/CreateOwner";
import { Owner } from "../../../src/application/owner/Owner";
import { faker } from "@faker-js/faker/.";
import { ApplicationException } from "../../../src/infra/exception/ApplicationException";

describe("CreateOwner", () => {
  let ownersRepository: CreateOwnerRepository;
  let passwordHasher: CreateOwnerPasswordHasher;
  let service: CreateOwner;
  let owner: Owner;

  beforeEach(() => {
    ownersRepository = {
      getByEmail: jest.fn(),
      create: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn().mockResolvedValue(faker.internet.password()),
      // compare: jest.fn(),
    };
    service = new CreateOwner();
    service.ownersRepository = ownersRepository;
    service.passwordHasher = passwordHasher;
    owner = {
      fullname: faker.person.fullName(),
      email: faker.internet.email(),
      password: "12345678@Ab",
      confirmation: "12345678@Ab",
      documentNumber: "111.111.111-11",
      birthday: "1990-01-01",
      bio: faker.lorem.sentence(),
      gender: "MALE",
      phoneNumber: "+5521996923202",
      address: {
        street: faker.location.streetAddress(),
        streetNumber: faker.location.buildingNumber(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        countryCode: "BR",
        zipCode: "21230-366",
      },
    };
  });

  it("should create a new owner", async () => {
    const result = await service.execute(owner);

    expect(result).toBeDefined();
    expect(result.owner_id).toBeDefined();
    expect(ownersRepository.getByEmail).toHaveBeenCalledWith(owner.email);
    expect(ownersRepository.getByEmail).toHaveBeenCalledTimes(1);
    expect(passwordHasher.hash).toHaveBeenCalledWith("12345678@Ab");
    expect(passwordHasher.hash).toHaveBeenCalledTimes(1);
    expect(ownersRepository.create).toHaveBeenCalledWith(owner);
    expect(ownersRepository.create).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if the owner already exists", async () => {
    ownersRepository.getByEmail = jest.fn().mockResolvedValue(owner);

    await expect(service.execute(owner)).rejects.toThrow(
      new ApplicationException(
        400,
        { message: "Email already in use" },
        "Email already in use"
      )
    );
  });
});
