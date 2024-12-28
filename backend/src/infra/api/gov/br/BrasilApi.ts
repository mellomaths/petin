import axios from "axios";
import { Inject } from "../../../di/DependencyInjection";
import { Settings } from "../../../settings/Settings";
import { ZipCodeCheckResponse } from "../../../../application/account/ZipCodeCheck";

axios.defaults.validateStatus = function () {
  return true;
};

export class BrasilApi {
  @Inject("Settings")
  settings: Settings;

  private getBaseUrl(): string {
    return this.settings.getGovernmentApis().br.brasilApiBaseUrl;
  }

  async validateCep(cep: string): Promise<ZipCodeCheckResponse> {
    const url = `${this.getBaseUrl()}/cep/v2/${cep}`;
    const response = await axios.get(url);
    if (response.status !== 200) {
      return { valid: false };
    }

    return response.data as ZipCodeCheckResponse;
  }
}
