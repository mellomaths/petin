import axios from "axios";
import { generateFakePet, setupDatabase } from "../helpers/Fake";
import { url } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

describe("CreatePetE2E", () => {
  let fakeAccount: { token: string; accountId: string };

  beforeAll(async () => {
    fakeAccount = await setupDatabase();
  });

  it("should create a dog", async () => {
    const token = fakeAccount.token;
    const pet = generateFakePet("DOG");
    const response = await axios.post(`${url}/pets`, pet, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ petId: expect.any(String) });
  });

  it("should create a cat", async () => {
    const token = fakeAccount.token;
    const pet = generateFakePet("CAT");
    const response = await axios.post(`${url}/pets`, pet, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ petId: expect.any(String) });
  });
});
