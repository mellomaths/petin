import { Profile } from "../../../src/application/account/Profile";
import { CreateProfile } from "../../../src/application/account/usecase/CreateProfile";
import { ApplicationException } from "../../../src/infra/exception/ApplicationException";

describe("CreateProfile", () => {
  let service: CreateProfile;
  let profile: Profile;

  beforeEach(() => {
    service = new CreateProfile();
    service.profilesRepository = {
      getByAccountId: jest.fn(),
      create: jest.fn(),
    };
    service.authenticate = {
      execute: jest.fn(),
      accountsRepository: {
        get: jest.fn(),
      },
      tokenGenerator: {
        verify: jest.fn(),
      },
    };
    profile = {
      accountId: "12345678",
      fullname: "John Doe",
      documentNumber: "111.111.111-11",
      birthdate: "1990-01-01",
      bio: "Lorem ipsum dolor",
      gender: "MALE",
      phoneNumber: "+5521996923202",
      address: {
        street: "Main Street",
        streetNumber: "123",
        city: "Springfield",
        state: "SP",
        countryCode: "BR",
        zipCode: "21230-366",
        latitude: -23.5489,
        longitude: -46.6388,
      },
    };
  });

  it("should create a new profile", async () => {
    const account = {
      id: "12345678",
      email: "john.doe@test.com",
    };
    service.authenticate.execute = jest.fn().mockResolvedValue(account);
    service.profilesRepository.getByAccountId = jest
      .fn()
      .mockResolvedValue(null);
    profile.accountId = account.id;
    const result = await service.execute("token", profile);
    expect(result).toEqual({ profileId: expect.any(String) });
    expect(service.authenticate.execute).toHaveBeenCalledTimes(1);
    expect(service.authenticate.execute).toHaveBeenCalledWith("token");
    expect(service.profilesRepository.getByAccountId).toHaveBeenCalledTimes(1);
    expect(service.profilesRepository.getByAccountId).toHaveBeenCalledWith(
      account.id
    );
    expect(service.profilesRepository.create).toHaveBeenCalledTimes(1);
    expect(service.profilesRepository.create).toHaveBeenCalledWith(profile);
  });

  it("should throw an error when profile already exists", async () => {
    const account = {
      id: "12345678",
      email: "john.doe@test.com",
    };
    service.authenticate.execute = jest.fn().mockResolvedValue(account);
    service.profilesRepository.getByAccountId = jest
      .fn()
      .mockResolvedValue(profile);
    profile.accountId = account.id;
    await expect(service.execute("token", profile)).rejects.toThrow(
      new ApplicationException(
        400,
        { message: "Profile already exists" },
        "Profile already exists"
      )
    );
    expect(service.authenticate.execute).toHaveBeenCalledTimes(1);
    expect(service.authenticate.execute).toHaveBeenCalledWith("token");
    expect(service.profilesRepository.getByAccountId).toHaveBeenCalledTimes(1);
    expect(service.profilesRepository.getByAccountId).toHaveBeenCalledWith(
      account.id
    );
    expect(service.profilesRepository.create).not.toHaveBeenCalled();
  });
});
