import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { CountryCode } from "../../account/Profile";

export class DocumentNumberValidator {
  static isValidBrazilDocumentNumber(documentNumber: string) {
    return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(documentNumber);
  }

  static validate(documentNumber: string, country: string) {
    if (
      country === CountryCode.BRAZIL &&
      !this.isValidBrazilDocumentNumber(documentNumber)
    ) {
      throw new ApplicationException(
        400,
        { message: "Document number is invalid" },
        "Document number is invalid"
      );
    }
  }
}
