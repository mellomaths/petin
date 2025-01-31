import { isBoolean, isDefined, isEnum } from "class-validator";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { DateStringValidator } from "../../core/validator/DateStringValidator";
import { Animal, Pet, Sex } from "../Pet";

export class PetValidator {
  static validate(pet: Pet) {
    if (!pet.name) {
      throw new ApplicationException(
        400,
        { message: "Name is required" },
        "Name is required"
      );
    }
    if (!pet.birthday) {
      throw new ApplicationException(
        400,
        { message: "Birthday is required" },
        "Birthday is required"
      );
    }
    if (!DateStringValidator.isValid(pet.birthday)) {
      throw new ApplicationException(
        400,
        { message: "Birthday must be a valid date" },
        "Birthday must be a valid date"
      );
    }
    if (!DateStringValidator.isValidPast(pet.birthday)) {
      throw new ApplicationException(
        400,
        { message: "Birthday must be in the past" },
        "Birthday must be in the past"
      );
    }
    if (!pet.bio) {
      throw new ApplicationException(
        400,
        { message: "Bio is required" },
        "Bio is required"
      );
    }
    if (!isEnum(pet.type, Animal)) {
      throw new ApplicationException(
        400,
        { message: "Invalid type" },
        "Invalid type"
      );
    }
    if (!isEnum(pet.sex, Sex)) {
      throw new ApplicationException(
        400,
        { message: "Invalid sex" },
        "Invalid sex"
      );
    }
    if (!isDefined(pet.donation) || !isBoolean(pet.donation)) {
      throw new ApplicationException(
        400,
        { message: "Donation must be a boolean" },
        "Donation must be a boolean"
      );
    }
    if (!isDefined(pet.adopted) || !isBoolean(pet.adopted)) {
      throw new ApplicationException(
        400,
        { message: "Adopted must be a boolean" },
        "Adopted must be a boolean"
      );
    }
    if (!isDefined(pet.archived) || !isBoolean(pet.archived)) {
      throw new ApplicationException(
        400,
        { message: "Archived must be a boolean" },
        "Archived must be a boolean"
      );
    }
  }
}
