import { isEmail } from "class-validator";
import { ApplicationException } from "../../../infra/exception/ApplicationException";

export class EmailValidator {
  static validate(email: string) {
    if (!isEmail(email)) {
      throw new ApplicationException(
        400,
        { message: "Email is invalid" },
        "Email is invalid"
      );
    }
  }
}
