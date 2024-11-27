import axios from "axios";
import { setupDatabase } from "../helpers/Fake";

axios.defaults.validateStatus = function () {
  return true;
};

describe("AuthenticateE2E", () => {
  let fakeAccount: { token: string; accountId: string; ownerId: string };

  beforeAll(async () => {
    fakeAccount = await setupDatabase();
  });

  it("should authenticate an account", async () => {
    const token = fakeAccount.token;
    const response = await axios.post(
      "http://localhost:3000/authenticate",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    expect(response.status).toBe(201);
    expect(response.data).toEqual({
      id: fakeAccount.accountId,
      email: expect.any(String),
      password: "",
      owner: {
        id: fakeAccount.ownerId,
        accountId: fakeAccount.accountId,
        fullname: expect.any(String),
        documentNumber: expect.any(String),
        birthday: expect.any(String),
        bio: expect.any(String),
        gender: expect.any(String),
        phoneNumber: expect.any(String),
        addressId: expect.any(String),
        address: {},
      },
    });
  });
});
