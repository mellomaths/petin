import { isPhoneNumber } from "class-validator";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { CountryCode } from "../../owner/Owner";

export class PhoneNumberValidator {
  static validate(phone: string, countryCode: string) {
    if (countryCode === CountryCode.BRAZIL && !isPhoneNumber(phone, "BR")) {
      throw new ApplicationException(
        400,
        { message: "Phone is invalid" },
        "Phone is invalid"
      );
    }
  }
}
