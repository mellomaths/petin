import { Account } from "../../../src/application/account/Account";
import { AccountValidator } from "../../../src/application/account/validator/AccountValidator";
import { generateFakeAccount } from "../../helpers/Fake";

describe("AccountValidator", () => {
  it("should validate an account", () => {
    const account: Account = generateFakeAccount();
    expect(() => AccountValidator.validate(account)).not.toThrow();
  });
});
