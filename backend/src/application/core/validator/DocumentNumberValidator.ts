import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { CountryCode } from "../../account/Profile";
import { BrCnpjValidator } from "./br/BrCnpjValidator";
import { BrCpfValidator } from "./br/BrCpfValidator";

export class DocumentNumberValidator {
  static isValidBrazilDocumentNumber(documentNumber: string) {
    const document = documentNumber.replace(/\D/g, "");
    if (document.length !== 11 && document.length !== 14) {
      return false;
    }

    if (document.length === 11) {
      return BrCpfValidator.isValidCpf(document);
    }

    return BrCnpjValidator.isValidCnpj(document);
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
