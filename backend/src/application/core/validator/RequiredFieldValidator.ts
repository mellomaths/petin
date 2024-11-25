import { ApplicationException } from "../../../infra/exception/ApplicationException";

export class RequiredFieldValidator {
  static validate(value: any, field: string) {
    if (!value) {
      throw new ApplicationException(
        400,
        { message: `${field} is required` },
        `${field} is required`
      );
    }
  }
}
