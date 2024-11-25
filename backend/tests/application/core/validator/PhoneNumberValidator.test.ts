import { PhoneNumberValidator } from "../../../../src/application/core/validator/PhoneNumberValidator";
import { ApplicationException } from "../../../../src/infra/exception/ApplicationException";

describe("PhoneNumberValidator", () => {
  it("should throw an error if phone is invalid", () => {
    const phone = "invalid-phone";
    const countryCode = "BR";
    expect(() => PhoneNumberValidator.validate(phone, countryCode)).toThrow(
      new ApplicationException(
        400,
        { message: "Phone is invalid" },
        "Phone is invalid"
      )
    );
  });

  it("should not throw an error if phone is valid", () => {
    const phone = "5511999999999";
    const countryCode = "BR";
    expect(() =>
      PhoneNumberValidator.validate(phone, countryCode)
    ).not.toThrow();
  });
});
