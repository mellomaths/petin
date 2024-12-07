import { isUUID } from "class-validator";
import { ApplicationException } from "../../../infra/exception/ApplicationException";

export class UuidValidator {
  static validate(uuid: string, field: string, required: boolean = true): void {
    if (!isUUID(uuid)) {
      throw new ApplicationException(
        400,
        { message: `${field} must be a valid UUID` },
        `${field} must be a valid UUID`
      );
    }
  }
}
