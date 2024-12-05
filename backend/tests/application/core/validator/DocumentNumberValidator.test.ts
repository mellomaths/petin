import { CountryCode } from "../../../../src/application/account/Profile";
import { DocumentNumberValidator } from "../../../../src/application/core/validator/DocumentNumberValidator";
import { ApplicationException } from "../../../../src/infra/exception/ApplicationException";

describe("DocumentNumberValidator", () => {
  describe("isValidBrazilDocumentNumber", () => {
    it("should validate a Brazil CPF document number", () => {
      let documentNumber = "522.304.550-52";
      expect(() =>
        DocumentNumberValidator.validate(documentNumber, CountryCode.BRAZIL)
      ).not.toThrow();
      documentNumber = "52807247008";
      expect(() =>
        DocumentNumberValidator.validate(documentNumber, CountryCode.BRAZIL)
      ).not.toThrow();
    });

    it("should validate a Brazil CNPJ document number", () => {
      let documentNumber = "01.733.927/0001-01";
      expect(() =>
        DocumentNumberValidator.validate(documentNumber, CountryCode.BRAZIL)
      ).not.toThrow();
      documentNumber = "01733927000101";
      expect(() =>
        DocumentNumberValidator.validate(documentNumber, CountryCode.BRAZIL)
      ).not.toThrow();
    });

    it("should throw an error if Brazil document number is invalid", () => {
      let documentNumber = "528.072.470-0";
      expect(() =>
        DocumentNumberValidator.validate(documentNumber, CountryCode.BRAZIL)
      ).toThrow(
        new ApplicationException(
          400,
          { message: "Document number is invalid" },
          "Document number is invalid"
        )
      );
      documentNumber = "01.73.927/0001-01";
      expect(() =>
        DocumentNumberValidator.validate(documentNumber, CountryCode.BRAZIL)
      ).toThrow(
        new ApplicationException(
          400,
          { message: "Document number is invalid" },
          "Document number is invalid"
        )
      );
    });
  });
});
