import axios from "axios";
import {
  generateFakePet,
  generateFakeProfile,
  setupDatabase,
} from "../helpers/Fake";
import { setupEnvironmentVariables, TestEnvironment } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

describe("CreatePetE2E", () => {
  let env: TestEnvironment;
  let fakeAccount: { token: string; accountId: string };

  beforeAll(async () => {
    env = setupEnvironmentVariables();
    fakeAccount = await setupDatabase();
    const profile = generateFakeProfile();
    profile.accountId = fakeAccount.accountId;
    await axios.post(`${env.url}/accounts/profiles`, profile, {
      headers: { Authorization: `Bearer ${fakeAccount.token}` },
    });
  });

  it("should create a dog", async () => {
    const token = fakeAccount.token;
    const pet = generateFakePet("DOG");
    const response = await axios.post(`${env.url}/pets`, pet, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ petId: expect.any(String) });
  });

  it("should create a cat", async () => {
    const token = fakeAccount.token;
    const pet = generateFakePet("CAT");
    const response = await axios.post(`${env.url}/pets`, pet, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ petId: expect.any(String) });
  });
});
