import { isEnum } from "class-validator";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { BrDocumentNumberType, CountryCode } from "../../account/Profile";
import { BrCnpjValidator } from "./br/BrCnpjValidator";
import { BrCpfValidator } from "./br/BrCpfValidator";

export class DocumentNumberValidator {
  static clean(documentNumber: string) {
    return documentNumber.replace(/\D/g, "");
  }

  static isValidBrazilDocumentNumber(
    documentNumber: string,
    documentNumberType: string
  ) {
    if (!isEnum(documentNumberType, BrDocumentNumberType)) {
      return false;
    }
    const document = DocumentNumberValidator.clean(documentNumber);
    if (document.length !== 11 && document.length !== 14) {
      return false;
    }

    if (document.length === 11) {
      return BrCpfValidator.isValidCpf(document);
    }

    return BrCnpjValidator.isValidCnpj(document);
  }

  static validate(
    documentNumber: string,
    documentNumberType: string,
    country: string
  ) {
    if (
      country === CountryCode.BRAZIL &&
      !this.isValidBrazilDocumentNumber(documentNumber, documentNumberType)
    ) {
      throw new ApplicationException(
        400,
        { message: "Document number is invalid" },
        "Document number is invalid"
      );
    }
  }
}
