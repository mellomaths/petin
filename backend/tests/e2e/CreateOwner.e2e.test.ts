import axios from "axios";
import { Account } from "../../src/application/account/Account";
import { Owner } from "../../src/application/owner/Owner";
import { faker } from "@faker-js/faker/.";
import { generateFakeAccount, generateFakeOwner } from "../helpers/Fake";

axios.defaults.validateStatus = function () {
  return true;
};

describe("CreateOwnerE2E", () => {
  it("should create an owner", async () => {
    const account: Account = generateFakeAccount();
    let response = await axios.post("http://localhost:3000/signup", account);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ accountId: expect.any(String) });
    const accountId = response.data.accountId;
    const owner: Owner = generateFakeOwner(accountId);
    response = await axios.post("http://localhost:3000/owners", owner);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ ownerId: expect.any(String) });
  });
});
