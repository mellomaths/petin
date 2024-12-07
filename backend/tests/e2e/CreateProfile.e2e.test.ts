import axios from "axios";
import { Account } from "../../src/application/account/Account";
import { url } from "../config/config";
import {
  generateFakeAccount,
  generateFakeProfile,
  setupDatabase,
} from "../helpers/Fake";
import { Profile } from "../../src/application/account/Profile";

axios.defaults.validateStatus = function () {
  return true;
};

describe("CreateProfileE2E", () => {
  let fakeAccount: { token: string; accountId: string };

  beforeAll(async () => {
    fakeAccount = await setupDatabase();
  });

  it("should create an profile", async () => {
    const account: Account = generateFakeAccount();
    const profile: Profile = generateFakeProfile();
    const response = await axios.post(`${url}/accounts/profiles`, profile, {
      headers: { Authorization: `Bearer ${fakeAccount.token}` },
    });
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ profileId: expect.any(String) });
  });
});
