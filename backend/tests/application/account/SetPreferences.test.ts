import { SetPreferences } from "../../../src/application/account/usecase/SetPreferences";
import { UUIDv7Strategy } from "../../../src/application/id/strategy/UUIDv7Strategy";
import { CreateNewId } from "../../../src/application/id/usecase/CreateNewId";

describe("SetPreferences", () => {
  let service: SetPreferences;

  beforeEach(() => {
    service = new SetPreferences();
    service.authenticate = {
      execute: jest.fn(),
      accountsRepository: {
        get: jest.fn(),
      },
      tokenGenerator: {
        verify: jest.fn(),
        decode: jest.fn(),
      },
    };
    service.preferencesRepository = {
      deleteAll: jest.fn(),
      save: jest.fn(),
    };
    service.createNewId = new CreateNewId(new UUIDv7Strategy());
  });

  it("should set preferences", async () => {
    service.authenticate.execute = jest
      .fn()
      .mockResolvedValue({ id: "12345678" });
    const preferences = [
      {
        key: "theme",
        value: "dark",
      },
      {
        key: "language",
        value: "en",
      },
    ];
    await service.execute("token", preferences);
    expect(service.authenticate.execute).toHaveBeenCalledTimes(1);
    expect(service.authenticate.execute).toHaveBeenCalledWith("token");
    expect(service.preferencesRepository.deleteAll).toHaveBeenCalledTimes(1);
    expect(service.preferencesRepository.deleteAll).toHaveBeenCalledWith(
      "12345678"
    );
    expect(service.preferencesRepository.save).toHaveBeenCalledTimes(1);
    expect(service.preferencesRepository.save).toHaveBeenCalledWith([
      {
        id: expect.any(String),
        accountId: "12345678",
        key: "theme",
        value: "dark",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      {
        id: expect.any(String),
        accountId: "12345678",
        key: "language",
        value: "en",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ]);
  });
});
