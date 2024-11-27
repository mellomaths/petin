import { faker } from "@faker-js/faker/.";
import axios from "axios";
import { Account } from "../../src/application/account/Account";
import { Owner } from "../../src/application/owner/Owner";
import { Pet } from "../../src/application/pet/Pet";
import { url } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

export function generateFakeAccount(): Account {
  const password = faker.internet.password({
    length: 8,
    prefix: "1Abc@",
  });
  const account: Account = {
    email: faker.internet.email(),
    password: password,
    confirmPassword: password,
  };
  return account;
}

export function generateFakeOwner(accountId: string): Owner {
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
    gender: faker.helpers.arrayElement(["FEMALE", "MALE"]),
    // phoneNumber: faker.helpers.fromRegExp(/55[1-9]{2}9[0-9]{4}[0-9]{4}/),
    phoneNumber: "5521996923202",
    address: {
      street: faker.location.street(),
      streetNumber: faker.location.buildingNumber(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      countryCode: "BR",
      zipCode: "21230-366",
    },
  };
  return owner;
}

export function generateFakePet(type: string): Pet {
  const pet = {
    name: faker.animal.dog(),
    birthday: faker.date.recent().toISOString().split("T")[0],
    bio: faker.person.bio(),
    sex: faker.person.sex().toUpperCase(),
    type,
  };
  return pet;
}

export async function setupDatabase(): Promise<{
  token: string;
  accountId: string;
  ownerId: string;
}> {
  const account: Account = generateFakeAccount();
  let response = await axios.post(`${url}/signup`, account);
  if (response.status !== 201) {
    console.log(response.status, response.data);
    throw new Error("Account not created");
  }
  const accountId = response.data.accountId;
  const owner: Owner = generateFakeOwner(accountId);
  response = await axios.post(`${url}/owners`, owner);
  if (response.status !== 201) {
    console.log(response.status, response.data);
    throw new Error("Owner not created");
  }
  const ownerId = response.data.ownerId;
  response = await axios.post(`${url}/login`, {
    email: account.email,
    password: account.password,
  });
  if (response.status !== 201) {
    console.log(response.status, response.data);
    throw new Error("Login failed");
  }
  const token = response.data.token;
  return { token, ownerId, accountId };
}
