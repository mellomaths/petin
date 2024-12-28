import axios from "axios";
import { setupEnvironmentVariables, TestEnvironment } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

describe("CheckDocumentNumberE2E", () => {
  let env: TestEnvironment;

  beforeAll(() => {
    env = setupEnvironmentVariables();
  });

  it("should validate a document number", async () => {
    const payload = {
      documentNumber: "636.201.327-12",
      documentNumberType: "CPF",
      countryCode: "BR",
    };
    const response = await axios.post(
      `${env.url}/validator/document-number`,
      payload
    );
    expect(response.status).toBe(201);
    const json = response.data;
    expect(json.valid).toBe(true);
  });
});
