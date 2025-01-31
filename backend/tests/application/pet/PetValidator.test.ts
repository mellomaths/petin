import { Pet } from "../../../src/application/pet/Pet";
import { PetValidator } from "../../../src/application/pet/validator/PetValidator";
import { ApplicationException } from "../../../src/infra/exception/ApplicationException";

describe("PetValidator", () => {
  let pet: Pet;

  beforeEach(() => {
    pet = {
      name: "Rex",
      birthday: "2020-01-01",
      bio: "A cute dog",
      sex: "MALE",
      type: "DOG",
      donation: true,
      adopted: false,
      archived: false,
    };
  });

  it("should validate a pet", () => {
    expect(() => PetValidator.validate(pet)).not.toThrow();
  });

  it("should throw an error if name is missing", () => {
    pet.name = "";
    expect(() => PetValidator.validate(pet)).toThrow(
      new ApplicationException(
        400,
        { message: "Name is required" },
        "Name is required"
      )
    );
  });

  it("should throw an error if birthday is missing", () => {
    pet.birthday = "";
    expect(() => PetValidator.validate(pet)).toThrow(
      new ApplicationException(
        400,
        { message: "Birthday is required" },
        "Birthday is required"
      )
    );
  });

  it("should throw an error if birthday is not a valid date", () => {
    pet.birthday = "invalid-date";
    expect(() => PetValidator.validate(pet)).toThrow(
      new ApplicationException(
        400,
        { message: "Birthday must be a valid date" },
        "Birthday must be a valid date"
      )
    );
  });

  it("should throw an error if birthday is in the future", () => {
    pet.birthday = "3000-01-01";
    expect(() => PetValidator.validate(pet)).toThrow(
      new ApplicationException(
        400,
        { message: "Birthday must be in the past" },
        "Birthday must be in the past"
      )
    );
  });

  it("should throw an error if bio is missing", () => {
    pet.bio = "";
    expect(() => PetValidator.validate(pet)).toThrow(
      new ApplicationException(
        400,
        { message: "Bio is required" },
        "Bio is required"
      )
    );
  });

  it("should throw an error if type is invalid", () => {
    pet.type = "invalid-type";
    expect(() => PetValidator.validate(pet)).toThrow(
      new ApplicationException(400, { message: "Invalid type" }, "Invalid type")
    );
  });

  it("should throw an error if sex is invalid", () => {
    pet.sex = "invalid-sex";
    expect(() => PetValidator.validate(pet)).toThrow(
      new ApplicationException(400, { message: "Invalid sex" }, "Invalid sex")
    );
  });

  it("should throw an error if donation is missing", () => {
    pet.donation = undefined as any;
    expect(() => PetValidator.validate(pet)).toThrow(
      new ApplicationException(
        400,
        { message: "Donation must be a boolean" },
        "Donation must be a boolean"
      )
    );
  });

  it("should throw an error if donation is not a boolean", () => {
    pet.donation = "true" as any;
    expect(() => PetValidator.validate(pet)).toThrow(
      new ApplicationException(
        400,
        { message: "Donation must be a boolean" },
        "Donation must be a boolean"
      )
    );
  });

  it("should throw an error if adopted is missing", () => {
    pet.adopted = undefined as any;
    expect(() => PetValidator.validate(pet)).toThrow(
      new ApplicationException(
        400,
        { message: "Adopted must be a boolean" },
        "Adopted must be a boolean"
      )
    );
  });

  it("should throw an error if adopted is not a boolean", () => {
    pet.adopted = "true" as any;
    expect(() => PetValidator.validate(pet)).toThrow(
      new ApplicationException(
        400,
        { message: "Adopted must be a boolean" },
        "Adopted must be a boolean"
      )
    );
  });

  it("should throw an error if archived is missing", () => {
    pet.archived = undefined as any;
    expect(() => PetValidator.validate(pet)).toThrow(
      new ApplicationException(
        400,
        { message: "Archived must be a boolean" },
        "Archived must be a boolean"
      )
    );
  });

  it("should throw an error if archived is not a boolean", () => {
    pet.archived = "true" as any;
    expect(() => PetValidator.validate(pet)).toThrow(
      new ApplicationException(
        400,
        { message: "Archived must be a boolean" },
        "Archived must be a boolean"
      )
    );
  });
});
