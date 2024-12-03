import { CountryCode } from "../../../../src/application/account/Profile";
import { DocumentNumberValidator } from "../../../../src/application/core/validator/DocumentNumberValidator";
import { ApplicationException } from "../../../../src/infra/exception/ApplicationException";

describe("DocumentNumberValidator", () => {
  it("should validate a Brazil document number", () => {
    const documentNumber = "123.456.789-09";
    expect(() =>
      DocumentNumberValidator.validate(documentNumber, CountryCode.BRAZIL)
    ).not.toThrow();
  });

  it("should throw an error if Brazil document number is invalid", () => {
    const documentNumber = "123.456.789-0";
    expect(() =>
      DocumentNumberValidator.validate(documentNumber, CountryCode.BRAZIL)
    ).toThrow(
      new ApplicationException(
        400,
        { message: "Document number is invalid" },
        "Document number is invalid"
      )
    );
  });
});
