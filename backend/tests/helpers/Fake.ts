import { faker } from "@faker-js/faker";
import axios from "axios";
import { Account } from "../../src/application/account/Account";
import { Pet } from "../../src/application/pet/Pet";
import { Profile } from "../../src/application/account/Profile";
import { setupEnvironmentVariables } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

const env = setupEnvironmentVariables();

export async function healthCheck(): Promise<void> {
  const response = await axios.get(`${env.url}/health`);
  console.log(response.status, response.data);
  if (response.status !== 200) {
    throw new Error("Health Check failed");
  }
}

export function generateFakeAccount(profile: boolean = true): Account {
  const password = faker.internet.password({
    length: 8,
    prefix: "1Abc@",
  });
  const account: Account = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    password: password,
    confirmPassword: password,
  };
  if (profile) {
    account.profile = generateFakeProfile();
    account.profile.accountId = account.id!;
  }
  return account;
}

export function generateFakeProfile(): Profile {
  const profile: Profile = {
    fullname: faker.person.fullName(),
    documentNumber: "784.131.810-38",
    birthdate: faker.date
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
      latitude: faker.location.latitude({ min: 0 }),
      longitude: faker.location.longitude({ min: 0 }),
    },
  };
  return profile;
}

export function generateFakePet(type: string): Pet {
  const pet: Pet = {
    id: faker.string.uuid(),
    ownerAccountId: faker.string.uuid(),
    name: faker.animal.dog(),
    birthday: faker.date.recent().toISOString().split("T")[0],
    bio: faker.person.bio(),
    sex: faker.person.sex().toUpperCase(),
    type,
    donation: true,
    adopted: false,
    archived: false,
    ownerAccountProfile: generateFakeProfile(),
  };
  return pet;
}

export async function setupDatabase(): Promise<{
  token: string;
  accountId: string;
}> {
  await healthCheck();
  const account: Account = generateFakeAccount(false);
  let response = await axios.post(`${env.url}/signup`, account);
  if (response.status !== 201) {
    console.log(response.status, response.data);
    throw new Error("Account not created");
  }
  const accountId = response.data.accountId;
  response = await axios.post(`${env.url}/login`, {
    email: account.email,
    password: account.password,
  });
  if (response.status !== 201) {
    console.log(response.status, response.data);
    throw new Error("Login failed");
  }
  const token = response.data.token;
  return { token, accountId };
}
