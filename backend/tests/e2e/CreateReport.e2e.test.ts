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

describe("CreateReportE2E", () => {
  let env: TestEnvironment;
  let createdByAccount: { token: string; accountId: string };
  let againstAccount: { token: string; accountId: string };
  let dog: Pet;

  beforeAll(async () => {
    env = setupEnvironmentVariables();
    createdByAccount = await setupDatabase();
    againstAccount = await setupDatabase();
    const profile = generateFakeProfile();
    profile.accountId = againstAccount.accountId;
    profile.address.latitude = -22.9505541;
    profile.address.longitude = -43.1822991;
    let response = await axios.post(`${env.url}/accounts/profiles`, profile, {
      headers: { Authorization: `Bearer ${againstAccount.token}` },
    });
    dog = generateFakePet("DOG");
    response = await axios.post(`${env.url}/pets`, dog, {
      headers: { Authorization: `Bearer ${againstAccount.token}` },
    });
    dog.id = response.data.petId;
  });

  it("should create a report", async () => {
    const token = createdByAccount.token;
    const response = await axios.post(
      `${env.url}/reports`,
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
    expect(response.data).toEqual({ reportId: expect.any(String) });
  });
});
