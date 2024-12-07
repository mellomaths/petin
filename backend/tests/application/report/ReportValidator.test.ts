import { faker } from "@faker-js/faker";
import { Report } from "../../../src/application/report/Report";
import { ReportValidator } from "../../../src/application/report/validator/ReportValidator";

describe("ReportValidator", () => {
  let report: Report;

  beforeEach(() => {
    report = {
      againstAccountId: faker.string.uuid(),
      petId: faker.string.uuid(),
      reason: "FAKE_ACCOUNT",
      explanation: "explanation",
    };
  });

  it("should throw error when Report object is empty", () => {
    expect(() => {
      ReportValidator.validate({} as Report);
    }).toThrow();
  });

  it("should throw error when againstAccountId is empty", () => {
    report.againstAccountId = "";
    expect(() => {
      ReportValidator.validate(report);
    }).toThrow();
  });

  it("should throw error if againstAccountId is not a valid UUID", () => {
    report.againstAccountId = "invalid-uuid";
    expect(() => {
      ReportValidator.validate(report);
    }).toThrow();
  });

  it("should throw error when petId is empty", () => {
    report.petId = "";
    expect(() => {
      ReportValidator.validate(report);
    }).toThrow();
  });

  it("should throw error if petId is not a valid UUID", () => {
    report.petId = "invalid-uuid";
    expect(() => {
      ReportValidator.validate(report);
    }).toThrow();
  });

  it("should throw error when reason is empty", () => {
    report.reason = "";
    expect(() => {
      ReportValidator.validate(report);
    }).toThrow();
  });

  it("should throw error when reason is invalid", () => {
    report.reason = "INVALID_REASON";
    expect(() => {
      ReportValidator.validate(report);
    }).toThrow();
  });

  it("should throw error when explanation is empty", () => {
    report.explanation = "";
    expect(() => {
      ReportValidator.validate(report);
    }).toThrow();
  });

  it("should throw error when explanation has more than 560 characters", () => {
    report.explanation = faker.lorem.words(561);
    expect(() => {
      ReportValidator.validate(report);
    }).toThrow();
  });

  it("should validate Report object", () => {
    expect(() => {
      ReportValidator.validate(report);
    }).not.toThrow();
  });
});
