import { ApplicationException } from "../../../infra/exception/ApplicationException";

export class PasswordValidator {
  static atLeastOneLowercaseLetter(password: string) {
    return /[a-z]/.test(password);
  }

  static atLeastOneUppercaseLetter(password: string) {
    return /[A-Z]/.test(password);
  }

  static atLeastOneNumber(password: string) {
    return /\d/.test(password);
  }

  static atLeastOneSpecialCharacter(password: string) {
    return /[@$!%*?&]/.test(password);
  }

  static validate(password: string, confirmation: string) {
    if (password.length < 8) {
      throw new ApplicationException(
        400,
        { message: "Password must have at least 8 characters" },
        "Password must have at least 8 characters"
      );
    }

    if (password !== confirmation) {
      throw new ApplicationException(
        400,
        { message: "Password and confirmation do not match" },
        "Password and confirmation do not match"
      );
    }

    if (!this.atLeastOneLowercaseLetter(password)) {
      throw new ApplicationException(
        400,
        { message: "Password must have at least one lowercase letter" },
        "Password must have at least one lowercase letter"
      );
    }

    if (!this.atLeastOneUppercaseLetter(password)) {
      throw new ApplicationException(
        400,
        { message: "Password must have at least one uppercase letter" },
        "Password must have at least one uppercase letter"
      );
    }

    if (!this.atLeastOneNumber(password)) {
      throw new ApplicationException(
        400,
        { message: "Password must have at least one number" },
        "Password must have at least one number"
      );
    }

    if (!this.atLeastOneSpecialCharacter(password)) {
      throw new ApplicationException(
        400,
        { message: "Password must have at least one special character" },
        "Password must have at least one special character"
      );
    }
  }
}
