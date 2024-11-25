import { EmailValidator } from "../../../../src/application/core/validator/EmailValidator";
import { ApplicationException } from "../../../../src/infra/exception/ApplicationException";

describe("EmailValidator", () => {
  it("should throw an error if email is invalid", () => {
    expect(() => {
      EmailValidator.validate("invalid-email");
    }).toThrow(
      new ApplicationException(
        400,
        { message: "Email is invalid" },
        "Email is invalid"
      )
    );
  });

  it("should not throw an error if email is valid", () => {
    expect(() => EmailValidator.validate("john.doe@google.com")).not.toThrow();
  });
});
