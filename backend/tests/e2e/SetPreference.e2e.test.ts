import axios from "axios";
import { setupDatabase } from "../helpers/Fake";
import { setupEnvironmentVariables, TestEnvironment } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

describe("SetPreferencesE2E", () => {
  let env: TestEnvironment;
  let fakeAccount: { token: string; accountId: string };

  beforeAll(async () => {
    env = setupEnvironmentVariables();
    fakeAccount = await setupDatabase();
  });

  it("should set preferences", async () => {
    const response = await axios.put(
      `${env.url}/accounts/preferences`,
      [
        {
          key: "theme",
          value: "dark",
        },
        {
          key: "language",
          value: "en",
        },
      ],
      {
        headers: { Authorization: `Bearer ${fakeAccount.token}` },
      }
    );
    expect(response.status).toBe(204);
  });
});
