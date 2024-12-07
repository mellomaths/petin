import { isArray, isEmpty, isString } from "class-validator";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { PreferenceInput } from "../Preference";

export class PreferencesValidator {
  static isValidKeyValue(key: string, value: string): boolean {
    return isString(key) && isString(value) && !isEmpty(key) && !isEmpty(value);
  }

  static validate(preferences: PreferenceInput[]): void {
    if (!preferences || preferences.length === 0) {
      throw new ApplicationException(
        400,
        { message: "Preferences cannot be empty" },
        "Preferences cannot be empty"
      );
    }
    if (!isArray(preferences)) {
      throw new ApplicationException(
        400,
        { message: "Preferences must be an array" },
        "Preferences must be an array"
      );
    }
    if (preferences.some((p) => !this.isValidKeyValue(p.key, p.value))) {
      throw new ApplicationException(
        400,
        { message: "Invalid preferences" },
        "Invalid preferences"
      );
    }
  }
}
