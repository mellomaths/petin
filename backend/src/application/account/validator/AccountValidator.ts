import { EmailValidator } from "../../core/validator/EmailValidator";
import { PasswordValidator } from "../../core/validator/PasswordValidator";
import { RequiredFieldValidator } from "../../core/validator/RequiredFieldValidator";
import { Account } from "../Account";

export class AccountValidator {
  static validateEmail(email: string) {
    RequiredFieldValidator.validate(email, "Email");
    EmailValidator.validate(email);
  }

  static validatePassword(password: string, confirmation: string) {
    RequiredFieldValidator.validate(password, "Password");
    RequiredFieldValidator.validate(confirmation, "Confirmation password");
    PasswordValidator.validate(password, confirmation);
  }

  static validate(account: Account) {
    this.validateEmail(account.email);
    this.validatePassword(account.password, account.confirmPassword!);
  }
}
