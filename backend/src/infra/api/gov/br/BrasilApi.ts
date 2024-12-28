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
      return { valid: false, zipCode: cep };
    }

    const data: ZipCodeCheckResponse = {
      valid: true,
      zipCode: response.data.cep,
      state: response.data.state,
      city: response.data.city,
      neighborhood: response.data.neighborhood,
      street: response.data.street,
      service: `BrasilApi::${response.data.service}`,
      location: {
        latitude: response.data.latitude,
        longitude: response.data.longitude,
      },
    };

    return data;
  }
}
