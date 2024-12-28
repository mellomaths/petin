import { ZipCodeApi } from "../../../../application/account/usecase/CheckZipCode";
import {
  ZipCodeCheck,
  ZipCodeCheckResponse,
} from "../../../../application/account/ZipCodeCheck";
import { Inject } from "../../../di/DependencyInjection";
import { Settings } from "../../../settings/Settings";
import { BrasilApi } from "./BrasilApi";

export class BrZipCodeApi implements ZipCodeApi {
  @Inject("Settings")
  settings: Settings;

  @Inject("BrasilApi")
  brasilApi: BrasilApi;

  async validate(payload: ZipCodeCheck): Promise<ZipCodeCheckResponse> {
    return this.brasilApi.validateCep(payload.zipCode);
  }
}
