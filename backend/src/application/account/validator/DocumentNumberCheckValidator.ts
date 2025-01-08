import { DocumentNumberValidator } from "../../core/validator/DocumentNumberValidator";
import { DocumentNumberCheck } from "../DocumentNumberCheck";

export class DocumentNumberCheckValidator {
  static validate(payload: DocumentNumberCheck): void {
    DocumentNumberValidator.validate(
      payload.documentNumber,
      payload.documentNumberType,
      payload.countryCode
    );
  }
}
