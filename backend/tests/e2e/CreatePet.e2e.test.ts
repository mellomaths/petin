import axios from "axios";
import { Pet } from "../../src/application/pet/Pet";
import { faker } from "@faker-js/faker/.";

axios.defaults.validateStatus = function () {
  return true;
};

describe("CreatePetE2E", () => {
  let pet: Pet;

  beforeEach(() => {
    pet = {
      name: faker.animal.dog(),
      birthday: faker.date.recent().toISOString().split("T")[0],
      bio: faker.person.bio(),
      sex: faker.person.sex().toUpperCase(),
      type: "DOG",
    };
  });

  it("should create a dog", async () => {
    pet.type = "DOG";

    const response = await axios.post("http://localhost:3000/pets", pet);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ pet_id: expect.any(String) });
  });

  it("should create a cat", async () => {
    pet.type = "CAT";

    const response = await axios.post("http://localhost:3000/pets", pet);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ pet_id: expect.any(String) });
  });
});
