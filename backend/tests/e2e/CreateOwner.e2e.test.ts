import axios from "axios";
import { Account } from "../../src/application/account/Account";
import { Owner } from "../../src/application/owner/Owner";
import { faker } from "@faker-js/faker/.";

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
      documentNumber: faker.helpers.fromRegExp(
        /[0-9]{3}.[0-9]{3}.[0-9]{3}-[0-9]{2}/
      ),
      birthday: faker.date
        .between({ from: "1900-01-01", to: "2006-01-01" })
        .toISOString()
        .split("T")[0],
      bio: faker.person.bio(),
      gender: "MALE",
      phoneNumber: faker.helpers.fromRegExp(/55[1-9]{2}9[0-9]{4}[0-9]{4}/),
      address: {
        street: faker.location.street(),
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
