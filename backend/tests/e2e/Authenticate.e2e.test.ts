import { faker } from "@faker-js/faker/.";
import { Account } from "../../src/application/account/Account";
import axios from "axios";

axios.defaults.validateStatus = function () {
  return true;
};

describe("AuthenticateE2E", () => {
  it("should authenticate an account", async () => {
    const password = faker.internet.password({
      length: 8,
      prefix: "1Abc@",
    });
    const account: Account = {
      email: faker.internet.email(),
      password: password,
      confirmPassword: password,
    };
    let response = await axios.post("http://localhost:3000/signup", account);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ account_id: expect.any(String) });

    response = await axios.post("http://localhost:3000/login", {
      email: account.email,
      password: account.password,
    });
    expect(response.status).toBe(201);
    expect(response.data).toEqual({
      token: expect.any(String),
      expiresIn: 3600,
    });

    const token = response.data.token;
    response = await axios.post(
      "http://localhost:3000/authenticate",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    expect(response.status).toBe(201);
    expect(response.data).toEqual({
      id: expect.any(String),
      email: account.email,
      password: "",
    });
  });
});
