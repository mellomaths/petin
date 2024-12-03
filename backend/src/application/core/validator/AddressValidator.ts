import { isEnum } from "class-validator";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { RequiredFieldValidator } from "./RequiredFieldValidator";
import { ZipCodeValidator } from "./ZipCodeValidator";
import { Address, CountryCode } from "../../account/Profile";

export class AddressValidator {
  static validateStreet(street: string) {
    RequiredFieldValidator.validate(street, "Street");
    if (street.length < 3) {
      throw new ApplicationException(
        400,
        { message: "Street is invalid" },
        "Street is invalid"
      );
    }
  }

  static validateNumber(number: string) {
    RequiredFieldValidator.validate(number, "Street Number");
  }

  static validateCity(city: string) {
    RequiredFieldValidator.validate(city, "City");
  }

  static validateState(state: string) {
    RequiredFieldValidator.validate(state, "State");
    if (state.length < 2) {
      throw new ApplicationException(
        400,
        { message: "State is invalid" },
        "State is invalid"
      );
    }
  }

  static validateCountryCode(countryCode: string) {
    RequiredFieldValidator.validate(countryCode, "Country Code");
    if (countryCode.length !== 2) {
      throw new ApplicationException(
        400,
        { message: "Country Code is invalid" },
        "Country Code is invalid"
      );
    }
    if (!isEnum(countryCode, CountryCode)) {
      throw new ApplicationException(
        400,
        { message: "Country Code is invalid" },
        "Country Code is invalid"
      );
    }
  }

  static validateZipCode(zipCode: string, countryCode: string) {
    RequiredFieldValidator.validate(zipCode, "Zip Code");
    ZipCodeValidator.validate(zipCode, countryCode);
  }

  static validate(address: Address) {
    this.validateStreet(address.street);
    this.validateNumber(address.streetNumber);
    this.validateCity(address.city);
    this.validateState(address.state);
    this.validateCountryCode(address.countryCode);
    this.validateZipCode(address.zipCode, address.countryCode);
  }
}
