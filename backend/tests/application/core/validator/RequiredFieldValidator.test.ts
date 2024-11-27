import { RequiredFieldValidator } from "../../../../src/application/core/validator/RequiredFieldValidator";
import { ApplicationException } from "../../../../src/infra/exception/ApplicationException";

describe("RequiredFieldValidator", () => {
  it("should throw an error if value is missing", () => {
    const value = "";
    const field = "Field";
    expect(() => RequiredFieldValidator.validate(value, field)).toThrow(
      new ApplicationException(
        400,
        { message: "Field is required" },
        "Field is required"
      )
    );
  });

  it("should not throw an error if value is not missing", () => {
    const value = "Value";
    const field = "Field";
    expect(() => RequiredFieldValidator.validate(value, field)).not.toThrow();
  });
});
