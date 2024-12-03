import axios from "axios";
import {
  generateFakePet,
  generateFakeProfile,
  setupDatabase,
} from "../helpers/Fake";
import { url } from "../config/config";
import { Pet } from "../../src/application/pet/Pet";

axios.defaults.validateStatus = function () {
  return true;
};

describe("ListPetsE2E", () => {
  let fakeAccount: { token: string; accountId: string };
  let dog: Pet;
  let cat: Pet;

  beforeAll(async () => {
    fakeAccount = await setupDatabase();
    const profile = generateFakeProfile();
    profile.accountId = fakeAccount.accountId;
    profile.address.latitude = -22.9505541;
    profile.address.longitude = -43.1822991;
    let response = await axios.post(`${url}/accounts/profiles`, profile, {
      headers: { Authorization: `Bearer ${fakeAccount.token}` },
    });
    dog = generateFakePet("DOG");
    response = await axios.post(`${url}/pets`, dog, {
      headers: { Authorization: `Bearer ${fakeAccount.token}` },
    });
    dog.id = response.data.pet_id;
    cat = generateFakePet("CAT");
    response = await axios.post(`${url}/pets`, cat, {
      headers: { Authorization: `Bearer ${fakeAccount.token}` },
    });
    cat.id = response.data.pet_id;
  });

  it("should list pets", async () => {
    const token = fakeAccount.token;
    const response = await axios.get(
      `${url}/pets?latitude=-22.9888419&longitude=-43.1923842&radius=10`,
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
