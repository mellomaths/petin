import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { CountryCode } from "../../account/Profile";

export class ZipCodeValidator {
  static clean(zipCode: string) {
    return zipCode.replace(/\D/g, "");
  }

  static isValidBrazilZipCode(zipCode: string) {
    return /^\d{5}-\d{3}$/.test(zipCode);
  }

  static validate(zipCode: string, country: string) {
    if (country === CountryCode.BRAZIL && !this.isValidBrazilZipCode(zipCode)) {
      throw new ApplicationException(
        400,
        { message: "Zip Code is invalid" },
        "Zip Code is invalid"
      );
    }
  }
}
