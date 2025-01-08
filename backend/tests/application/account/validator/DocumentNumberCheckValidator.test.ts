import { DocumentNumberCheckValidator } from "../../../../src/application/account/validator/DocumentNumberCheckValidator";

describe("DocumentNumberCheckValidator", () => {
  it("should check a valid document number", () => {
    const payload = {
      documentNumber: "636.201.327-12",
      documentNumberType: "CPF",
      countryCode: "BR",
    };

    expect(() => DocumentNumberCheckValidator.validate(payload)).not.toThrow();
  });
});
