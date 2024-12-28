import { CheckDocumentNumber } from "../../../src/application/account/usecase/CheckDocumentNumber";

describe("CheckDocumentNumber", () => {
  let service: CheckDocumentNumber;

  beforeEach(() => {
    service = new CheckDocumentNumber();
    service.brDocumentNumberApi = {
      validate: jest.fn(),
    };
  });

  it("should check document number", async () => {
    const payload = {
      documentNumber: "111.111.111-11",
      documentNumberType: "CPF",
      countryCode: "BR",
    };
    service.brDocumentNumberApi.validate = jest
      .fn()
      .mockResolvedValue({ valid: true });
    await service.execute(payload);
    expect(service.brDocumentNumberApi.validate).toHaveBeenCalledWith(payload);
  });

  it("should throw an error if country is not supported", async () => {
    const payload = {
      documentNumber: "111.111.111-11",
      documentNumberType: "CPF",
      countryCode: "US",
    };
    await expect(service.execute(payload)).rejects.toThrow(
      "Country not supported"
    );
  });
});
