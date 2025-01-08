import axios from "axios";
import {
  generateFakePet,
  generateFakeProfile,
  setupDatabase,
} from "../helpers/Fake";
import { Pet } from "../../src/application/pet/Pet";
import { setupEnvironmentVariables, TestEnvironment } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

describe("ListPetsE2E", () => {
  let env: TestEnvironment;
  let fakeAccount: { token: string; accountId: string };
  let dog: Pet;
  let cat: Pet;

  beforeAll(async () => {
    env = setupEnvironmentVariables();
    fakeAccount = await setupDatabase();
    const profile = generateFakeProfile();
    profile.accountId = fakeAccount.accountId;
    profile.address.latitude = -22.9505541;
    profile.address.longitude = -43.1822991;
    let response = await axios.post(`${env.url}/accounts/profiles`, profile, {
      headers: { Authorization: `Bearer ${fakeAccount.token}` },
    });
    dog = generateFakePet("DOG");
    response = await axios.post(`${env.url}/pets`, dog, {
      headers: { Authorization: `Bearer ${fakeAccount.token}` },
    });
    dog.id = response.data.petId;
    cat = generateFakePet("CAT");
    response = await axios.post(`${env.url}/pets`, cat, {
      headers: { Authorization: `Bearer ${fakeAccount.token}` },
    });
    cat.id = response.data.petId;
  });

  it("should list pets", async () => {
    const token = fakeAccount.token;
    const response = await axios.get(
      `${env.url}/pets?latitude=-22.9888419&longitude=-43.1923842&radius=10`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThanOrEqual(2);
    expect(response.data.find((pet: Pet) => pet.id === dog.id)).toBeDefined();
    expect(response.data.find((pet: Pet) => pet.id === cat.id)).toBeDefined();
  });
});
