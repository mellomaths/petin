import axios from "axios";
import { Account } from "../../src/application/account/Account";
import { generateFakeAccount } from "../helpers/Fake";
import { url } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

describe("SignupE2E", () => {
  it("should create an account", async () => {
    const account: Account = generateFakeAccount();
    const response = await axios.post(`${url}/signup`, account);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ accountId: expect.any(String) });
  });
});
