import { PasswordValidator } from "../../../../src/application/core/validator/PasswordValidator";
import { ApplicationException } from "../../../../src/infra/exception/ApplicationException";

describe("PasswordValidator", () => {
  it("should throw an error if password is less than 8 characters", () => {
    expect(() => {
      PasswordValidator.validate("Abc1$", "Abc1$");
    }).toThrow(
      new ApplicationException(
        400,
        { message: "Password must have at least 8 characters" },
        "Password must have at least 8 characters"
      )
    );
  });

  it("should throw an error if password and confirmation do not match", () => {
    expect(() => {
      PasswordValidator.validate("Abc123$%", "Abc123$$");
    }).toThrow(
      new ApplicationException(
        400,
        { message: "Password and confirmation do not match" },
        "Password and confirmation do not match"
      )
    );
  });

  it("should throw an error if password does not have at least one lowercase letter", () => {
    expect(() => {
      PasswordValidator.validate("ABC123$%", "ABC123$%");
    }).toThrow(
      new ApplicationException(
        400,
        { message: "Password must have at least one lowercase letter" },
        "Password must have at least one lowercase letter"
      )
    );
  });

  it("should throw an error if password does not have at least one uppercase letter", () => {
    expect(() => {
      PasswordValidator.validate("abc123$%", "abc123$%");
    }).toThrow(
      new ApplicationException(
        400,
        { message: "Password must have at least one uppercase letter" },
        "Password must have at least one uppercase letter"
      )
    );
  });

  it("should throw an error if password does not have at least one number", () => {
    expect(() => {
      PasswordValidator.validate("Abcdefg$", "Abcdefg$");
    }).toThrow(
      new ApplicationException(
        400,
        { message: "Password must have at least one number" },
        "Password must have at least one number"
      )
    );
  });

  it("should throw an error if password does not have at least one special character", () => {
    expect(() => {
      PasswordValidator.validate("Abc12345", "Abc12345");
    }).toThrow(
      new ApplicationException(
        400,
        { message: "Password must have at least one special character" },
        "Password must have at least one special character"
      )
    );
  });

  it("should not throw an error if password is valid", () => {
    expect(() =>
      PasswordValidator.validate("Abc1234$", "Abc1234$")
    ).not.toThrow();
  });
});
