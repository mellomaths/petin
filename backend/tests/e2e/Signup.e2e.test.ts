import { faker } from "@faker-js/faker/.";
import axios from "axios";
import { Account } from "../../src/application/account/Account";

axios.defaults.validateStatus = function () {
  return true;
};

describe("SignupE2E", () => {
  it("should create an account", async () => {
    const account: Account = {
      email: faker.internet.email(),
      password: "1234567@Abc",
      confirmPassword: "1234567@Abc",
    };
    const response = await axios.post("http://localhost:3000/signup", account);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ account_id: expect.any(String) });
  });
});
