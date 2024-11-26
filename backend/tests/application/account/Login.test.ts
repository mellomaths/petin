import { Account } from "../../../src/application/account/Account";
import {
  Login,
  LoginAuthTokenGenerator,
  LoginPasswordHasher,
  LoginRepository,
} from "../../../src/application/account/usecase/Login";
import { ApplicationException } from "../../../src/infra/exception/ApplicationException";

describe("Login", () => {
  let service: Login;
  let accountsRepository: LoginRepository;
  let passwordHasher: LoginPasswordHasher;
  let tokenGenerator: LoginAuthTokenGenerator;

  beforeEach(() => {
    service = new Login();
    accountsRepository = {
      getByEmail: jest.fn(),
    };
    passwordHasher = {
      compare: jest.fn(),
    };
    tokenGenerator = {
      generate: jest.fn(),
    };
    service.accountsRepository = accountsRepository;
    service.passwordHasher = passwordHasher;
    service.tokenGenerator = tokenGenerator;
  });

  it("should return a token when the account exists and the password is correct", async () => {
    const account: Account = {
      id: "1",
      email: "john.doe@google.com",
      password: "hashed_password",
    };
    accountsRepository.getByEmail = jest.fn().mockResolvedValue(account);
    passwordHasher.compare = jest.fn().mockResolvedValue(true);
    tokenGenerator.generate = jest.fn().mockReturnValue("token");

    const result = await service.execute("john.doe@google.com", "password");
    expect(result).toEqual({ token: expect.any(String), expiresIn: 3600 });
    expect(accountsRepository.getByEmail).toHaveBeenCalledWith(
      "john.doe@google.com"
    );
    expect(passwordHasher.compare).toHaveBeenCalledWith(
      "password",
      "hashed_password"
    );
    expect(tokenGenerator.generate).toHaveBeenCalledWith(
      {
        sub: "1",
        account_id: "1",
      },
      3600
    );
  });

  it("should throw an error when the account does not exist", async () => {
    accountsRepository.getByEmail = jest.fn().mockResolvedValue(null);
    await expect(
      service.execute("john.doe@google.com", "password")
    ).rejects.toThrow(
      new ApplicationException(
        404,
        { message: "Account not found" },
        "Account not found"
      )
    );
  });

  it("should throw an error when the password is incorrect", async () => {
    const account: Account = {
      id: "1",
      email: "john.doe@google.com",
      password: "hashed_password",
    };
    accountsRepository.getByEmail = jest.fn().mockResolvedValue(account);
    passwordHasher.compare = jest.fn().mockResolvedValue(false);
    await expect(
      service.execute("john.doe@google.com", "password")
    ).rejects.toThrow(
      new ApplicationException(
        401,
        { message: "Invalid password" },
        "Invalid password"
      )
    );
  });
});
