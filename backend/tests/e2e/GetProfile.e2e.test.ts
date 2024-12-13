import axios from "axios";
import {
  generateFakePet,
  generateFakeProfile,
  setupDatabase,
} from "../helpers/Fake";
import { Pet } from "../../src/application/pet/Pet";
import { Profile } from "../../src/application/account/Profile";
import { setupEnvironmentVariables, TestEnvironment } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

describe("GetProfile", () => {
  let env: TestEnvironment;
  let fakeAccount: { token: string; accountId: string };
  let profile: Profile;
  let dog: Pet;
  let cat: Pet;

  beforeAll(async () => {
    env = setupEnvironmentVariables();
    fakeAccount = await setupDatabase();
    profile = generateFakeProfile();
    profile.accountId = fakeAccount.accountId;
    let response = await axios.post(`${env.url}/accounts/profiles`, profile, {
      headers: { Authorization: `Bearer ${fakeAccount.token}` },
    });
    profile.id = response.data.profileId;
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

  it("should get profile", async () => {
    const token = fakeAccount.token;
    const response = await axios.get(
      `${env.url}/accounts/profiles?expands=pets`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    expect(response.status).toBe(200);

    expect(response.data.profile.id).toEqual(profile.id!);
    expect(response.data.profile.accountId).toEqual(profile.accountId);
    expect(
      response.data.pets.find((pet: Pet) => pet.id === dog.id)
    ).toBeDefined();
    expect(
      response.data.pets.find((pet: Pet) => pet.id === cat.id)
    ).toBeDefined();
  });
});
