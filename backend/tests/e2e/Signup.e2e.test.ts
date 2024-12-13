import axios from "axios";
import { Account } from "../../src/application/account/Account";
import { generateFakeAccount } from "../helpers/Fake";
import { setupEnvironmentVariables, TestEnvironment } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

describe("SignupE2E", () => {
  let env: TestEnvironment;

  beforeAll(() => {
    env = setupEnvironmentVariables();
  });

  it("should create an account", async () => {
    const account: Account = generateFakeAccount();
    const response = await axios.post(`${env.url}/signup`, account);
    expect(response.data).toEqual({ accountId: expect.any(String) });
  });
});
