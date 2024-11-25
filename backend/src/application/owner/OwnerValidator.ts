import { isEmail, isEnum } from "class-validator";
import { ApplicationException } from "../../infra/exception/ApplicationException";
import { Gender, Owner } from "./Owner";
import { DateStringValidator } from "../core/validator/DateStringValidator";
import { DocumentNumberValidator } from "../core/validator/DocumentNumberValidator";
import { RequiredFieldValidator } from "../core/validator/RequiredFieldValidator";
import { PasswordValidator } from "../core/validator/PasswordValidator";
import { AddressValidator } from "../core/validator/AddressValidator";
import { PhoneNumberValidator } from "../core/validator/PhoneNumberValidator";
import { EmailValidator } from "../core/validator/EmailValidator";

export class OwnerValidator {
  static validateFullname(fullname: string) {
    RequiredFieldValidator.validate(fullname, "Fullname");
    if (fullname.length < 3) {
      throw new ApplicationException(
        400,
        { message: "Fullname must have at least 3 characters" },
        "Fullname must have at least 3 characters"
      );
    }
  }

  static validateEmail(email: string) {
    RequiredFieldValidator.validate(email, "Email");
    EmailValidator.validate(email);
  }

  static validatePassword(password: string, confirmation: string) {
    RequiredFieldValidator.validate(password, "Password");
    RequiredFieldValidator.validate(confirmation, "Confirmation password");
    PasswordValidator.validate(password, confirmation);
  }

  static validateDocumentNumber(documentNumber: string, countryCode: string) {
    RequiredFieldValidator.validate(documentNumber, "Document number");
    DocumentNumberValidator.validate(documentNumber, countryCode);
  }

  static validateBirthday(birthday: string) {
    RequiredFieldValidator.validate(birthday, "Birthday");
    if (!DateStringValidator.isValid(birthday)) {
      throw new ApplicationException(
        400,
        { message: "Birthday is required" },
        "Birthday is required"
      );
    }
    if (!DateStringValidator.isValidPast(birthday)) {
      throw new ApplicationException(
        400,
        { message: "Birthday must be in the past" },
        "Birthday must be in the past"
      );
    }
    if (!DateStringValidator.isValidAdult(birthday)) {
      throw new ApplicationException(
        400,
        { message: "Owner must be at least 18 years old" },
        "Owner must be at least 18 years old"
      );
    }
  }

  static validateBio(bio: string) {
    RequiredFieldValidator.validate(bio, "Bio");
    if (bio.length < 6) {
      throw new ApplicationException(
        400,
        { message: "Bio must have at least 6 characters" },
        "Bio must have at least 6 characters"
      );
    }
  }

  static validateGender(gender: string) {
    RequiredFieldValidator.validate(gender, "Gender");
    if (!isEnum(gender, Gender)) {
      throw new ApplicationException(
        400,
        { message: "Gender is invalid" },
        "Gender is invalid"
      );
    }
  }

  static validatePhoneNumber(phoneNumber: string, countryCode: string) {
    RequiredFieldValidator.validate(phoneNumber, "Phone");
    PhoneNumberValidator.validate(phoneNumber, countryCode);
  }

  static validate(owner: Owner) {
    this.validateFullname(owner.fullname);
    this.validateEmail(owner.email);
    this.validatePassword(owner.password, owner.confirmation);
    this.validateDocumentNumber(
      owner.documentNumber,
      owner.address.countryCode
    );
    this.validateBirthday(owner.birthday);
    this.validateBio(owner.bio);
    this.validateGender(owner.gender);
    this.validatePhoneNumber(owner.phoneNumber, owner.address.countryCode);
    AddressValidator.validate(owner.address);
  }
}
