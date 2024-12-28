import { Inject } from "../../../infra/di/DependencyInjection";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { DocumentNumberValidator } from "../../core/validator/DocumentNumberValidator";
import {
  DocumentNumberCheck,
  DocumentNumberCheckResponse,
} from "../DocumentNumberCheck";
import { CountryCode } from "../Profile";
import { DocumentNumberCheckValidator } from "../validator/DocumentNumberCheckValidator";

export class CheckDocumentNumber {
  @Inject("BrDocumentNumberApi")
  brDocumentNumberApi: DocumentNumberApi;

  async execute(
    payload: DocumentNumberCheck
  ): Promise<DocumentNumberCheckResponse> {
    DocumentNumberCheckValidator.validate(payload);
    payload.documentNumber = DocumentNumberValidator.clean(
      payload.documentNumber
    );
    if (payload.countryCode === CountryCode.BRAZIL.toString()) {
      return this.brDocumentNumberApi.validate(payload);
    }
    throw new ApplicationException(
      400,
      { message: "Country not supported" },
      "Country not supported"
    );
  }
}

export interface DocumentNumberApi {
  validate(payload: DocumentNumberCheck): Promise<DocumentNumberCheckResponse>;
}
