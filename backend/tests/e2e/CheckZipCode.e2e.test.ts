import axios from "axios";
import { setupEnvironmentVariables, TestEnvironment } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

describe("CheckZipCodeE2E", () => {
  let env: TestEnvironment;

  beforeAll(() => {
    env = setupEnvironmentVariables();
  });

  it("should validate a zip code", async () => {
    const payload = {
      zipCode: "21331-590",
      countryCode: "BR",
    };
    const response = await axios.post(`${env.url}/validator/zip-code`, payload);
    expect(response.status).toBe(201);
    const json = response.data;
    expect(json.valid).toBe(true);
  });
});
