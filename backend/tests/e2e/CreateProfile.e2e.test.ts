import axios from "axios";
import { Account } from "../../src/application/account/Account";
import {
  generateFakeAccount,
  generateFakeProfile,
  setupDatabase,
} from "../helpers/Fake";
import { Profile } from "../../src/application/account/Profile";
import { setupEnvironmentVariables, TestEnvironment } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

describe("CreateProfileE2E", () => {
  let env: TestEnvironment;
  let fakeAccount: { token: string; accountId: string };

  beforeAll(async () => {
    env = setupEnvironmentVariables();
    fakeAccount = await setupDatabase();
  });

  it("should create an profile", async () => {
    const account: Account = generateFakeAccount();
    const profile: Profile = generateFakeProfile();
    const response = await axios.post(`${env.url}/accounts/profiles`, profile, {
      headers: { Authorization: `Bearer ${fakeAccount.token}` },
    });
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ profileId: expect.any(String) });
  });
});
