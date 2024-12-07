import { BrCnpjValidator } from "../../../../../src/application/core/validator/br/BrCnpjValidator";

describe("BrCnpjValidator", () => {
  it("should validate CNPJ", () => {
    let documentNumber = "99.079.239/0001-66";
    expect(BrCnpjValidator.isValidCnpj(documentNumber)).toBeTruthy();
    documentNumber = "91668366000199";
    expect(BrCnpjValidator.isValidCnpj(documentNumber)).toBeTruthy();
  });

  it("should return false if CNPJ is empty", () => {
    expect(BrCnpjValidator.isValidCnpj("")).toBeFalsy();
  });

  it("should return false if CNPJ is not 14 digits lenghty", () => {
    expect(BrCnpjValidator.isValidCnpj("99.079.239/0001-667")).toBeFalsy();
    expect(BrCnpjValidator.isValidCnpj("9166836600019")).toBeFalsy();
  });

  it("should return false if CNPJ is invalid", () => {
    expect(BrCnpjValidator.isValidCnpj("99.079.239/0001-67")).toBeFalsy();
    expect(BrCnpjValidator.isValidCnpj("91668366000198")).toBeFalsy();
  });
});
