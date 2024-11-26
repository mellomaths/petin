import { faker } from "@faker-js/faker/.";
import axios from "axios";
import { Account } from "../../src/application/account/Account";
import { Owner } from "../../src/application/owner/Owner";

axios.defaults.validateStatus = function () {
  return true;
};

describe("CreateOwnerE2E", () => {
  it("should create an owner", async () => {
    const account: Account = {
      email: faker.internet.email(),
      password: "1234567@Abc",
      confirmPassword: "1234567@Abc",
    };

    let response = await axios.post("http://localhost:3000/signup", account);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ account_id: expect.any(String) });
    const accountId = response.data.account_id;

    const owner: Owner = {
      accountId,
      fullname: faker.person.fullName(),
      documentNumber: "111.111.111-11",
      birthday: "1990-01-01",
      bio: faker.lorem.sentence(),
      gender: "MALE",
      phoneNumber: "+5521996923202",
      address: {
        street: faker.location.streetAddress(),
        streetNumber: faker.location.buildingNumber(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        countryCode: "BR",
        zipCode: "21230-366",
      },
    };

    response = await axios.post("http://localhost:3000/owners", owner);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ owner_id: expect.any(String) });
  });
});
