import { ZipCodeCheckValidator } from "../../../../src/application/account/validator/ZipCodeCheckValidator";

describe("ZipCodeCheckValidator", () => {
  it("should check a valid zip code", () => {
    const payload = {
      zipCode: "21331-590",
      countryCode: "BR",
    };

    expect(() => ZipCodeCheckValidator.validate(payload)).not.toThrow();
  });
});
