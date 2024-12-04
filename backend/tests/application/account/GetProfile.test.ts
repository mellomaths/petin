import { GetProfile } from "../../../src/application/account/usecase/GetProfile";

describe("GetProfile", () => {
  let service: GetProfile;

  beforeEach(() => {
    service = new GetProfile();
    service.authenticate = {
      execute: jest.fn(),
      accountsRepository: {
        get: jest.fn(),
      },
      tokenGenerator: {
        verify: jest.fn(),
      },
    };
    service.profilesRepository = {
      getByAccountId: jest.fn(),
    };
    service.petsRepository = {
      listByAccountId: jest.fn(),
    };
  });

  it("should return profile", async () => {
    service.authenticate.execute = jest
      .fn()
      .mockResolvedValue({ id: "account_id" });
    service.profilesRepository.getByAccountId = jest
      .fn()
      .mockResolvedValue({ id: "profile_id" });
    const result = await service.execute("token");
    expect(result).toEqual({ profile: { id: "profile_id" }, pets: [] });
    expect(service.petsRepository.listByAccountId).not.toHaveBeenCalled();
  });

  it("should return profile with pets", async () => {
    service.authenticate.execute = jest
      .fn()
      .mockResolvedValue({ id: "account_id" });
    service.profilesRepository.getByAccountId = jest
      .fn()
      .mockResolvedValue({ id: "profile_id" });
    service.petsRepository.listByAccountId = jest
      .fn()
      .mockResolvedValue([{ id: "pet_id" }]);
    const result = await service.execute("token", ["pets"]);
    expect(result).toEqual({
      profile: { id: "profile_id" },
      pets: [{ id: "pet_id" }],
    });
    expect(service.profilesRepository.getByAccountId).toHaveBeenCalledWith(
      "account_id"
    );
    expect(service.petsRepository.listByAccountId).toHaveBeenCalledWith(
      "account_id"
    );
  });

  it("should throw error when profile not found", async () => {
    service.authenticate.execute = jest
      .fn()
      .mockResolvedValue({ id: "account_id" });
    service.profilesRepository.getByAccountId = jest
      .fn()
      .mockResolvedValue(null);
    await expect(service.execute("token")).rejects.toThrow(
      "Profile not registred"
    );
    expect(service.profilesRepository.getByAccountId).toHaveBeenCalledWith(
      "account_id"
    );
    expect(service.petsRepository.listByAccountId).not.toHaveBeenCalled();
  });
});
