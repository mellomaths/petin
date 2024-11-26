import axios from "axios";
import { Pet } from "../../src/application/pet/Pet";

describe("CreatePetE2E", () => {
  it("should create a pet", async () => {
    const pet: Pet = {
      name: "Rex",
      birthday: "2020-01-01",
      bio: "A cute dog",
      sex: "MALE",
      type: "DOG",
    };

    const response = await axios.post("http://localhost:3000/pets", pet);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ pet_id: expect.any(String) });
  });
});
