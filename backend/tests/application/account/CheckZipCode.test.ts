import { CheckZipCode } from "../../../src/application/account/usecase/CheckZipCode";
import { ZipCodeCheckValidator } from "../../../src/application/account/validator/ZipCodeCheckValidator";
import { ApplicationException } from "../../../src/infra/exception/ApplicationException";

describe("CheckZipCode", () => {
  let service: CheckZipCode;

  beforeEach(() => {
    service = new CheckZipCode();
    service.brZipCodeApi = {
      validate: jest.fn(),
    };
  });

  it("should check zip code", async () => {
    const payload = {
      zipCode: "21230-366",
      countryCode: "BR",
    };
    service.brZipCodeApi.validate = jest
      .fn()
      .mockResolvedValue({ valid: true });
    await service.execute(payload);
    expect(service.brZipCodeApi.validate).toHaveBeenCalledWith(payload);
  });

  it("should throw an error if country is not supported", async () => {
    const payload = {
      zipCode: "21230-366",
      countryCode: "US",
    };
    ZipCodeCheckValidator.validate = jest.fn();
    await expect(service.execute(payload)).rejects.toThrow(
      new ApplicationException(
        400,
        { message: "Country not supported" },
        "Country not supported"
      )
    );
  });
});
