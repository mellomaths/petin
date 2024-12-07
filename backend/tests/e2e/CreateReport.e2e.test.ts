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

describe("CreateReportE2E", () => {
  let createdByAccount: { token: string; accountId: string };
  let againstAccount: { token: string; accountId: string };
  let dog: Pet;

  beforeAll(async () => {
    createdByAccount = await setupDatabase();
    againstAccount = await setupDatabase();
    const profile = generateFakeProfile();
    profile.accountId = againstAccount.accountId;
    profile.address.latitude = -22.9505541;
    profile.address.longitude = -43.1822991;
    let response = await axios.post(`${url}/accounts/profiles`, profile, {
      headers: { Authorization: `Bearer ${againstAccount.token}` },
    });
    dog = generateFakePet("DOG");
    response = await axios.post(`${url}/pets`, dog, {
      headers: { Authorization: `Bearer ${againstAccount.token}` },
    });
    dog.id = response.data.petId;
  });

  it("should create a report", async () => {
    const token = createdByAccount.token;
    const response = await axios.post(
      `${url}/reports`,
      {
        againstAccountId: againstAccount.accountId,
        petId: dog.id,
        reason: "INAPPROPRIATE_CONTENT",
        explanation: "Lorem ipsum dolor",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log(response.status, response.data);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ reportId: expect.any(String) });
  });
});
