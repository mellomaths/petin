import { Inject } from "../../../infra/di/DependencyInjection";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { ZipCodeCheckValidator } from "../validator/ZipCodeCheckValidator";
import { ZipCodeCheck, ZipCodeCheckResponse } from "../ZipCodeCheck";

export class CheckZipCode {
  @Inject("BrZipCodeApi")
  brZipCodeApi: ZipCodeApi;

  async execute(payload: ZipCodeCheck): Promise<ZipCodeCheckResponse> {
    ZipCodeCheckValidator.validate(payload);
    payload.zipCode.replace(/\D/g, "");
    if (payload.countryCode === "BR") {
      return this.brZipCodeApi.validate(payload);
    }

    throw new ApplicationException(
      400,
      { message: "Country not supported" },
      "Country not supported"
    );
  }
}

export interface ZipCodeApi {
  validate(payload: ZipCodeCheck): Promise<ZipCodeCheckResponse>;
}
