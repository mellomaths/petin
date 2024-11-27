import { faker } from "@faker-js/faker/.";
import { Owner } from "../../../src/application/owner/Owner";
import { ApplicationException } from "../../../src/infra/exception/ApplicationException";
import { OwnerValidator } from "../../../src/application/owner/validator/OwnerValidator";

describe("OwnerValidator", () => {
  let owner: Owner;

  beforeEach(() => {
    owner = {
      fullname: faker.person.fullName(),
      accountId: "12345678",
      documentNumber: "111.111.111-11",
      birthday: "1990-01-01",
      bio: faker.lorem.sentence(),
      gender: "MALE",
      phoneNumber: "+5521996923202",
      address: {
        street: faker.location.streetAddress(),
        streetNumber: faker.location.buildingNumber(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        countryCode: "BR",
        zipCode: "21230-366",
      },
    };
  });

  it("should validate an owner", () => {
    expect(() => OwnerValidator.validate(owner)).not.toThrow();
  });

  it("should throw an error if fullname is less than 3 length", () => {
    owner.fullname = "ab";
    expect(() => OwnerValidator.validate(owner)).toThrow(
      new ApplicationException(
        400,
        { message: "Fullname must have at least 3 characters" },
        "Fullname must have at least 3 characters"
      )
    );
  });

  it("should throw an error if birthday is not valid", () => {
    owner.birthday = "2023-01-0";
    expect(() => OwnerValidator.validate(owner)).toThrow(
      new ApplicationException(
        400,
        { message: "Birthday is required" },
        "Birthday is required"
      )
    );
  });

  it("should throw an error if birthday is not in the past", () => {
    owner.birthday = "3000-01-01";
    expect(() => OwnerValidator.validate(owner)).toThrow(
      new ApplicationException(
        400,
        { message: "Birthday must be in the past" },
        "Birthday must be in the past"
      )
    );
  });

  it("should throw an error if birthday is not an adult", () => {
    owner.birthday = "2023-01-01";
    expect(() => OwnerValidator.validate(owner)).toThrow(
      new ApplicationException(
        400,
        { message: "Owner must be at least 18 years old" },
        "Owner must be at least 18 years old"
      )
    );
  });

  it("should throw an error if bio is less than 6 length", () => {
    owner.bio = "ab";
    expect(() => OwnerValidator.validate(owner)).toThrow(
      new ApplicationException(
        400,
        { message: "Bio must have at least 6 characters" },
        "Bio must have at least 6 characters"
      )
    );
  });

  it("should throw an error if gender not an enum", () => {
    owner.gender = "AB";
    expect(() => OwnerValidator.validate(owner)).toThrow(
      new ApplicationException(
        400,
        { message: "Gender is invalid" },
        "Gender is invalid"
      )
    );
  });
});
