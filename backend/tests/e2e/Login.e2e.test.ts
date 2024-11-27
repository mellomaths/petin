import { Account } from "../../src/application/account/Account";
import axios from "axios";
import { generateFakeAccount } from "../helpers/Fake";
import { url } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

describe("LoginE2E", () => {
  it("should return a token when the account exists and the password is correct", async () => {
    const account: Account = generateFakeAccount();
    let response = await axios.post(`${url}/signup`, account);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ accountId: expect.any(String) });
    response = await axios.post(`${url}/login`, {
      email: account.email,
      password: account.password,
    });
    expect(response.status).toBe(201);
    expect(response.data).toEqual({
      token: expect.any(String),
      expiresIn: 3600,
    });
  });
});