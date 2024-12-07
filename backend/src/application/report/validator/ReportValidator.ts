import { isEnum, isString, isUUID, maxLength } from "class-validator";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { Reason, Report } from "../Report";
import { RequiredFieldValidator } from "../../core/validator/RequiredFieldValidator";
import { UuidValidator } from "../../core/validator/UuidValidator";

export class ReportValidator {
  static validateAgainstAccountId(againstAccountId: string): void {
    RequiredFieldValidator.validate(againstAccountId, "Against account ID");
    UuidValidator.validate(againstAccountId, "Against account ID");
  }

  static validatePetId(petId: string): void {
    RequiredFieldValidator.validate(petId, "Pet ID");
    UuidValidator.validate(petId, "Pet ID");
  }

  static validateReason(reason: string): void {
    RequiredFieldValidator.validate(reason, "Reason");
    if (!isEnum(reason, Reason)) {
      throw new ApplicationException(
        400,
        { message: "Invalid reason" },
        "Invalid reason"
      );
    }
  }

  static validateExplanation(explanation: string): void {
    RequiredFieldValidator.validate(explanation, "Explanation");
    if (!maxLength(explanation, 560)) {
      throw new ApplicationException(
        400,
        { message: "Explanation must have at most 560 characters" },
        "Explanation must have at most 560 characters"
      );
    }
  }

  static validate(report: Report): void {
    if (!report) {
      throw new ApplicationException(
        400,
        { message: "Report cannot be empty" },
        "Report cannot be empty"
      );
    }
    this.validateAgainstAccountId(report.againstAccountId);
    this.validatePetId(report.petId);
    this.validateReason(report.reason);
    this.validateExplanation(report.explanation);
  }
}
