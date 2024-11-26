import { Owner } from "../../../src/application/owner/Owner";
import { faker } from "@faker-js/faker/.";
import { ApplicationException } from "../../../src/infra/exception/ApplicationException";
import {
  CreateOwner,
  CreateOwnerAccountsRepository,
  CreateOwnerPasswordHasher,
  CreateOwnerRepository,
} from "../../../src/application/owner/usecase/CreateOwner";
import { Account } from "../../../src/application/account/Account";

describe("CreateOwner", () => {
  let ownersRepository: CreateOwnerRepository;
  let accountsRepository: CreateOwnerAccountsRepository;
  let passwordHasher: CreateOwnerPasswordHasher;
  let service: CreateOwner;
  let owner: Owner;

  beforeEach(() => {
    ownersRepository = {
      getByEmail: jest.fn(),
      create: jest.fn(),
    };
    accountsRepository = {
      get: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn().mockResolvedValue(faker.internet.password()),
      // compare: jest.fn(),
    };
    service = new CreateOwner();
    service.ownersRepository = ownersRepository;
    service.accountsRepository = accountsRepository;
    service.passwordHasher = passwordHasher;
    owner = {
      fullname: faker.person.fullName(),
      accountId: "12345678",
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
    const account: Account = {
      id: "12345678",
      email: faker.internet.email(),
      password: faker.internet.password(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    accountsRepository.get = jest.fn().mockResolvedValue(account);
    const result = await service.execute(owner);

    expect(result).toBeDefined();
    expect(result.owner_id).toBeDefined();
    expect(accountsRepository.get).toHaveBeenCalledWith(owner.accountId);
    expect(accountsRepository.get).toHaveBeenCalledTimes(1);
    expect(ownersRepository.create).toHaveBeenCalledWith(owner);
    expect(ownersRepository.create).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if the account doesn't exist", async () => {
    accountsRepository.get = jest.fn().mockResolvedValue(null);

    await expect(service.execute(owner)).rejects.toThrow(
      new ApplicationException(
        404,
        { message: "Account not created" },
        "Account not created"
      )
    );
  });
});
