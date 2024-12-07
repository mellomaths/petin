import {
  Preference,
  PreferenceInput,
} from "../../../../src/application/account/Preference";
import { PreferencesValidator } from "../../../../src/application/account/validator/PreferencesValidator";
import { ApplicationException } from "../../../../src/infra/exception/ApplicationException";

describe("PreferencesValidator", () => {
  it("should throw an error if preferences is null", () => {
    const preferences = null;
    expect(() => PreferencesValidator.validate(preferences as any)).toThrow(
      new ApplicationException(
        400,
        { message: "Preferences cannot be empty" },
        "Preferences cannot be empty"
      )
    );
  });

  it("should throw an error if preferences is empty", () => {
    const preferences: PreferenceInput[] = [];
    expect(() => PreferencesValidator.validate(preferences)).toThrow(
      new ApplicationException(
        400,
        { message: "Preferences cannot be empty" },
        "Preferences cannot be empty"
      )
    );
  });

  it("should throw an error if preferences is not an array", () => {
    const preferences = {} as any;
    expect(() => PreferencesValidator.validate(preferences)).toThrow(
      new ApplicationException(
        400,
        { message: "Preferences must be an array" },
        "Preferences must be an array"
      )
    );
  });

  it("should throw an error if preferences contains an invalid key", () => {
    const preferences: PreferenceInput[] = [
      { key: "key", value: "value" },
      { key: "", value: "value" },
      { key: "key", value: "value" },
    ];
    expect(() => PreferencesValidator.validate(preferences)).toThrow(
      new ApplicationException(
        400,
        { message: "Invalid preferences" },
        "Invalid preferences"
      )
    );
  });

  it("should throw an error if preferences contains an invalid value", () => {
    const preferences: PreferenceInput[] = [
      { key: "key", value: "value" },
      { key: "key", value: "value" },
      { key: "key", value: "" },
      { key: "key", value: "value" },
    ];
    expect(() => PreferencesValidator.validate(preferences)).toThrow(
      new ApplicationException(
        400,
        { message: "Invalid preferences" },
        "Invalid preferences"
      )
    );
  });

  it("should validate preferences", () => {
    const preferences: PreferenceInput[] = [
      {
        key: "RadiusSearch",
        value: "10",
      },
      {
        key: "Visible",
        value: "false",
      },
    ];
    expect(() => PreferencesValidator.validate(preferences)).not.toThrow();
  });
});
