import { IdStrategy } from "../../src/application/id/strategy/IdStrategy";

export function mockAuthenticate() {
  return {
    accountsRepository: {
      get: jest.fn(),
    },
    tokenGenerator: {
      verify: jest.fn(),
      decode: jest.fn(),
    },
    execute: jest.fn().mockResolvedValue({ id: "account_id" }),
  };
}
