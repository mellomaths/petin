import {
  Authenticate,
  AuthenticateRepository,
  AuthenticateTokenGenerator,
} from "../../../src/application/account/usecase/Authenticate";
import { ApplicationException } from "../../../src/infra/exception/ApplicationException";

describe("Authenticate", () => {
  let service: Authenticate;
  let accountsRepository: AuthenticateRepository;
  let tokenGenerator: AuthenticateTokenGenerator;

  beforeEach(() => {
    accountsRepository = {
      get: jest.fn(),
    };
    tokenGenerator = {
      verify: jest.fn(),
      decode: jest.fn(),
    };
    service = new Authenticate();
    service.accountsRepository = accountsRepository;
    service.tokenGenerator = tokenGenerator;
  });

  it("should throw an error if token is not provided", async () => {
    await expect(service.execute("")).rejects.toThrow(
      new ApplicationException(401, { message: "Unauthorized" }, "Unauthorized")
    );
  });

  it("should throw an error if token is invalid", async () => {
    tokenGenerator.verify = jest.fn().mockReturnValue(null);
    await expect(service.execute("token")).rejects.toThrow(
      new ApplicationException(401, { message: "Unauthorized" }, "Unauthorized")
    );
  });

  it("should throw an error if account is not found", async () => {
    tokenGenerator.verify = jest.fn().mockReturnValue({ account_id: "id" });
    accountsRepository.get = jest.fn().mockResolvedValue(null);
    await expect(service.execute("token")).rejects.toThrow(
      new ApplicationException(401, { message: "Unauthorized" }, "Unauthorized")
    );
  });

  it("should throw unable to read decoded token", async () => {
    tokenGenerator.verify = jest.fn().mockReturnValue({ account_id: "id" });
    tokenGenerator.decode = jest.fn().mockReturnValue(null);
    await expect(service.execute("token")).rejects.toThrow(
      new ApplicationException(401, { message: "Unauthorized" }, "Unauthorized")
    );
  });

  it("should throw an error if token is expired", async () => {
    tokenGenerator.verify = jest
      .fn()
      .mockReturnValue({ account_id: "id", exp: 1733359996 });
    accountsRepository.get = jest.fn().mockResolvedValue({ id: "id" });
    await expect(service.execute("token")).rejects.toThrow(
      new ApplicationException(401, { message: "Unauthorized" }, "Unauthorized")
    );
  });

  it("should return the account", async () => {
    tokenGenerator.decode = jest
      .fn()
      .mockReturnValue({ account_id: "id", exp: Date.now() / 1000 + 3600 });
    tokenGenerator.verify = jest.fn().mockReturnValue({ account_id: "id" });
    accountsRepository.get = jest.fn().mockResolvedValue({
      id: "id",
      password: "password",
      owner: { id: "id" },
    });
    const account = await service.execute("token");
    expect(account).toEqual({ id: "id", password: "", owner: { id: "id" } });
  });
});
