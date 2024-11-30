import { isEnum } from "class-validator";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { DateStringValidator } from "../../core/validator/DateStringValidator";
import { DocumentNumberValidator } from "../../core/validator/DocumentNumberValidator";
import { EmailValidator } from "../../core/validator/EmailValidator";
import { PasswordValidator } from "../../core/validator/PasswordValidator";
import { RequiredFieldValidator } from "../../core/validator/RequiredFieldValidator";
import { PhoneNumberValidator } from "../../core/validator/PhoneNumberValidator";
import { AddressValidator } from "../../core/validator/AddressValidator";
import { Gender, Profile } from "../Profile";

export class ProfileValidator {
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

  static validateBirthdate(birthdate: string) {
    RequiredFieldValidator.validate(birthdate, "Birthdate");
    if (!DateStringValidator.isValid(birthdate)) {
      throw new ApplicationException(
        400,
        { message: "Birthdate is required" },
        "Birthdate is required"
      );
    }
    if (!DateStringValidator.isValidPast(birthdate)) {
      throw new ApplicationException(
        400,
        { message: "Birthdate must be in the past" },
        "Birthdate must be in the past"
      );
    }
    if (!DateStringValidator.isValidAdult(birthdate)) {
      throw new ApplicationException(
        400,
        { message: "Profile must be at least 18 years old" },
        "Profile must be at least 18 years old"
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

  static validate(profile: Profile) {
    this.validateFullname(profile.fullname);
    this.validateDocumentNumber(
      profile.documentNumber,
      profile.address.countryCode
    );
    this.validateBirthdate(profile.birthdate);
    this.validateBio(profile.bio);
    this.validateGender(profile.gender);
    this.validatePhoneNumber(profile.phoneNumber, profile.address.countryCode);
    AddressValidator.validate(profile.address);
  }
}
