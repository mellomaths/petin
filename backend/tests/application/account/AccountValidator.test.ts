import { faker } from "@faker-js/faker/.";
import { Account } from "../../../src/application/account/Account";
import { AccountValidator } from "../../../src/application/account/validator/AccountValidator";

describe("AccountValidator", () => {
  it("should validate an account", () => {
    const account: Account = {
      email: faker.internet.email(),
      password: "1234567@Abc",
      confirmPassword: "1234567@Abc",
    };

    expect(() => AccountValidator.validate(account)).not.toThrow();
  });
});
