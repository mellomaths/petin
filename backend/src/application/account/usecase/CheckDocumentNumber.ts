import { Inject } from "../../../infra/di/DependencyInjection";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { CountryCode } from "../Profile";

export class CheckDocumentNumber {
  @Inject("BrDocumentNumberApi")
  brDocumentNumberApi: DocumentNumberApi;

  async execute(
    documentNumber: string,
    type: string,
    country: string
  ): Promise<boolean> {
    if (country === CountryCode.BRAZIL.toString()) {
      return this.brDocumentNumberApi.validate(documentNumber, type);
    }
    throw new ApplicationException(
      400,
      { message: "Country not supported" },
      "Country not supported"
    );
  }
}

export interface DocumentNumberApi {
  validate(documentNumber: string, type: string): Promise<boolean>;
}
