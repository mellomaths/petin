import { faker } from "@faker-js/faker";
import { ApplicationException } from "../../../src/infra/exception/ApplicationException";
import { Profile } from "../../../src/application/account/Profile";
import { ProfileValidator } from "../../../src/application/account/validator/ProfileValidator";

describe("ProfileValidator", () => {
  let profile: Profile;

  beforeEach(() => {
    profile = {
      fullname: faker.person.fullName(),
      accountId: "12345678",
      documentNumber: "784.131.810-38",
      birthdate: "1990-01-01",
      bio: faker.lorem.sentence(),
      gender: "MAN",
      phoneNumber: "+5521996923202",
      address: {
        street: faker.location.streetAddress(),
        streetNumber: faker.location.buildingNumber(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        countryCode: "BR",
        zipCode: "21230-366",
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
      },
    };
  });

  it("should validate an profile", () => {
    expect(() => ProfileValidator.validate(profile)).not.toThrow();
  });

  it("should throw an error if fullname is less than 3 length", () => {
    profile.fullname = "ab";
    expect(() => ProfileValidator.validate(profile)).toThrow(
      new ApplicationException(
        400,
        { message: "Fullname must have at least 3 characters" },
        "Fullname must have at least 3 characters"
      )
    );
  });

  it("should throw an error if birthdate is not valid", () => {
    profile.birthdate = "2023-01-0";
    expect(() => ProfileValidator.validate(profile)).toThrow(
      new ApplicationException(
        400,
        { message: "Birthdate is required" },
        "Birthdate is required"
      )
    );
  });

  it("should throw an error if birthdate is not in the past", () => {
    profile.birthdate = "3000-01-01";
    expect(() => ProfileValidator.validate(profile)).toThrow(
      new ApplicationException(
        400,
        { message: "Birthdate must be in the past" },
        "Birthdate must be in the past"
      )
    );
  });

  it("should throw an error if birthdate is not an adult", () => {
    profile.birthdate = "2023-01-01";
    expect(() => ProfileValidator.validate(profile)).toThrow(
      new ApplicationException(
        400,
        { message: "Profile must be at least 18 years old" },
        "Profile must be at least 18 years old"
      )
    );
  });

  it("should throw an error if bio is less than 6 length", () => {
    profile.bio = "ab";
    expect(() => ProfileValidator.validate(profile)).toThrow(
      new ApplicationException(
        400,
        { message: "Bio must have at least 6 characters" },
        "Bio must have at least 6 characters"
      )
    );
  });

  it("should throw an error if gender not an enum", () => {
    profile.gender = "AB";
    expect(() => ProfileValidator.validate(profile)).toThrow(
      new ApplicationException(
        400,
        { message: "Gender is invalid" },
        "Gender is invalid"
      )
    );
  });
});
