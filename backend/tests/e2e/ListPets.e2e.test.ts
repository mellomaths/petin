import axios from "axios";
import { generateFakePet, setupDatabase } from "../helpers/Fake";
import { url } from "../config/config";

axios.defaults.validateStatus = function () {
  return true;
};

describe("ListPetsE2E", () => {
  let fakeAccount: { token: string; accountId: string; ownerId: string };

  beforeAll(async () => {
    fakeAccount = await setupDatabase();
    await axios.post(`${url}/pets`, generateFakePet("DOG"), {
      headers: { Authorization: `Bearer ${fakeAccount.token}` },
    });
    await axios.post(`${url}/pets`, generateFakePet("CAT"), {
      headers: { Authorization: `Bearer ${fakeAccount.token}` },
    });
  });

  it("should list pets", async () => {
    const token = fakeAccount.token;
    const response = await axios.get(`${url}/pets`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(response.status, response.data);
    expect(response.status).toBe(200);
    expect(response.data.length).toEqual(2);
  });
});
