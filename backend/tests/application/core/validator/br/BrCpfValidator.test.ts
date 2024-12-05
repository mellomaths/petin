import { BrCpfValidator } from "../../../../../src/application/core/validator/br/BrCpfValidator";

describe("BrCpfValidator", () => {
  it("should validate CPF", () => {
    let documentNumber = "362.858.150-89";
    expect(BrCpfValidator.isValidCpf(documentNumber)).toBeTruthy();
    documentNumber = "31997464039";
    expect(BrCpfValidator.isValidCpf(documentNumber)).toBeTruthy();
  });

  it("should return false if CPF string is empty", () => {
    let documentNumber = "";
    expect(BrCpfValidator.isValidCpf(documentNumber)).toBeFalsy();
  });

  it("should return false if CPF is not 11 digits lenghty", () => {
    let documentNumber = "528072470081";
    expect(BrCpfValidator.isValidCpf(documentNumber)).toBeFalsy();

    documentNumber = "5280724700";
    expect(BrCpfValidator.isValidCpf(documentNumber)).toBeFalsy();
  });

  it("should return false if CPF is invalid", () => {
    let documentNumber = "522.304.550-53";
    expect(BrCpfValidator.isValidCpf(documentNumber)).toBeFalsy();
    documentNumber = "52807247078";
    expect(BrCpfValidator.isValidCpf(documentNumber)).toBeFalsy();
  });
});
