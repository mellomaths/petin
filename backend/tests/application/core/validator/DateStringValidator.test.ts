import { DateStringValidator } from "../../../../src/application/core/validator/DateStringValidator";

describe("DateStringValidator", () => {
  it("should validate date string", () => {
    const date = "2020-01-01";
    expect(DateStringValidator.isValid(date)).toBe(true);
  });

  it("should validate past date", () => {
    const date = "2020-01-01";
    expect(DateStringValidator.isValidPast(date)).toBe(true);
  });

  it("should validate adult date", () => {
    const date = "2000-01-01";
    expect(DateStringValidator.isValidAdult(date)).toBe(true);
  });
});
