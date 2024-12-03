import axios from "axios";
import { setupDatabase } from "../helpers/Fake";
import { url } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

describe("AuthenticateE2E", () => {
  let fakeAccount: { token: string; accountId: string };

  beforeAll(async () => {
    fakeAccount = await setupDatabase();
  });

  it("should authenticate an account", async () => {
    const token = fakeAccount.token;
    const response = await axios.post(
      `${url}/authenticate`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    expect(response.status).toBe(201);
    expect(response.data).toEqual({
      id: fakeAccount.accountId,
      email: expect.any(String),
      password: "",
    });
  });
});
