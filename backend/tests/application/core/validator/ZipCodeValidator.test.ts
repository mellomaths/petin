import { ZipCodeValidator } from "../../../../src/application/core/validator/ZipCodeValidator";
import { ApplicationException } from "../../../../src/infra/exception/ApplicationException";

describe("ZipCodeValidator", () => {
  it("should throw an error if zip code is invalid", () => {
    const zipCode = "00000-00";
    const country = "BR";
    expect(() => ZipCodeValidator.validate(zipCode, country)).toThrow(
      new ApplicationException(
        400,
        { message: "Zip Code is invalid" },
        "Zip Code is invalid"
      )
    );
  });

  it("should not throw an error if zip code is valid", () => {
    const zipCode = "12345-678";
    const country = "BR";
    expect(() => ZipCodeValidator.validate(zipCode, country)).not.toThrow();
  });
});
