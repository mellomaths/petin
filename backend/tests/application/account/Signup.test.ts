import { faker } from "@faker-js/faker";
import {
  Signup,
  SignupPasswordHasher,
  SignupRepository,
} from "../../../src/application/account/usecase/Signup";
import { Account } from "../../../src/application/account/Account";
import { ApplicationException } from "../../../src/infra/exception/ApplicationException";
import { UUIDv7Strategy } from "../../../src/application/id/strategy/UUIDv7Strategy";
import { CreateNewId } from "../../../src/application/id/usecase/CreateNewId";

describe("Signup", () => {
  let service: Signup;
  let accountsRepository: SignupRepository;
  let passwordHasher: SignupPasswordHasher;

  beforeEach(() => {
    accountsRepository = {
      getByEmail: jest.fn(),
      create: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn(),
    };
    service = new Signup();
    service.accountsRepository = accountsRepository;
    service.passwordHasher = passwordHasher;
    service.createNewId = new CreateNewId(new UUIDv7Strategy());
  });

  it("should create an account", async () => {
    const account: Account = {
      email: faker.internet.email(),
      password: "1234567@Abc",
      confirmPassword: "1234567@Abc",
    };
    accountsRepository.getByEmail = jest.fn().mockResolvedValue(null);
    passwordHasher.hash = jest.fn().mockResolvedValue("hashed_password");

    const result = await service.execute(account);
    expect(result).toBeDefined();
    expect(result).toEqual({ accountId: expect.any(String) });
    expect(accountsRepository.getByEmail).toHaveBeenCalledTimes(1);
    expect(accountsRepository.getByEmail).toHaveBeenCalledWith(account.email);
    expect(passwordHasher.hash).toHaveBeenCalledTimes(1);
    expect(accountsRepository.create).toHaveBeenCalledTimes(1);
    expect(accountsRepository.create).toHaveBeenCalledWith({
      ...account,
      id: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      password: "hashed_password",
    });
  });

  it("should throw an error if the account already exists", async () => {
    const account: Account = {
      email: faker.internet.email(),
      password: "1234567@Abc",
      confirmPassword: "1234567@Abc",
    };
    accountsRepository.getByEmail = jest.fn().mockResolvedValue(account);

    await expect(service.execute(account)).rejects.toThrow(
      new ApplicationException(
        409,
        { message: "Account already exists" },
        "Account already exists"
      )
    );
    expect(accountsRepository.getByEmail).toHaveBeenCalledTimes(1);
    expect(accountsRepository.getByEmail).toHaveBeenCalledWith(account.email);
    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(accountsRepository.create).not.toHaveBeenCalled();
  });
});
