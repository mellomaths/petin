import { ZipCodeCheck } from "../ZipCodeCheck";
import { AddressValidator } from "../../core/validator/AddressValidator";

export class ZipCodeCheckValidator {
  static validate(zipCodeCheck: ZipCodeCheck) {
    AddressValidator.validateCountryCode(zipCodeCheck.countryCode);
    AddressValidator.validateZipCode(
      zipCodeCheck.zipCode,
      zipCodeCheck.countryCode
    );
  }
}
