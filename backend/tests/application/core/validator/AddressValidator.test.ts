import { Address } from "../../../../src/application/account/Profile";
import { AddressValidator } from "../../../../src/application/core/validator/AddressValidator";
import { ApplicationException } from "../../../../src/infra/exception/ApplicationException";

describe("AddressValidator", () => {
  it("should validate street if street is empty", () => {
    const street = "";
    expect(() => AddressValidator.validateStreet(street)).toThrow(
      new ApplicationException(
        400,
        { message: "Street is required" },
        "Street is required"
      )
    );
  });

  it("should validate street if street length is less than 3", () => {
    const street = "A";
    expect(() => AddressValidator.validateStreet(street)).toThrow(
      new ApplicationException(
        400,
        { message: "Street is invalid" },
        "Street is invalid"
      )
    );
  });

  it("should validate number if number is empty", () => {
    const number = "";
    expect(() => AddressValidator.validateNumber(number)).toThrow(
      new ApplicationException(
        400,
        { message: "Street Number is required" },
        "Street Number is required"
      )
    );
  });

  it("should validate city if city is empty", () => {
    const city = "";
    expect(() => AddressValidator.validateCity(city)).toThrow(
      new ApplicationException(
        400,
        { message: "City is required" },
        "City is required"
      )
    );
  });

  it("should validate state if state is empty", () => {
    const state = "";
    expect(() => AddressValidator.validateState(state)).toThrow(
      new ApplicationException(
        400,
        { message: "State is required" },
        "State is required"
      )
    );
  });

  it("should validate state if state length is less than 2", () => {
    const state = "A";
    expect(() => AddressValidator.validateState(state)).toThrow(
      new ApplicationException(
        400,
        { message: "State is invalid" },
        "State is invalid"
      )
    );
  });

  it("should validate country code if country code is empty", () => {
    const countryCode = "";
    expect(() => AddressValidator.validateCountryCode(countryCode)).toThrow(
      new ApplicationException(
        400,
        { message: "Country Code is required" },
        "Country Code is required"
      )
    );
  });

  it("should validate country code if country code length is not 2", () => {
    const countryCode = "ABC";
    expect(() => AddressValidator.validateCountryCode(countryCode)).toThrow(
      new ApplicationException(
        400,
        { message: "Country Code is invalid" },
        "Country Code is invalid"
      )
    );
  });

  it("should validate country code if country code is not an enum", () => {
    const countryCode = "ZZ";
    expect(() => AddressValidator.validateCountryCode(countryCode)).toThrow(
      new ApplicationException(
        400,
        { message: "Country Code is invalid" },
        "Country Code is invalid"
      )
    );
  });

  it("should validate zip code if zip code is empty", () => {
    const zipCode = "";
    const countryCode = "BR";
    expect(() =>
      AddressValidator.validateZipCode(zipCode, countryCode)
    ).toThrow(
      new ApplicationException(
        400,
        { message: "Zip Code is required" },
        "Zip Code is required"
      )
    );
  });

  it("should validate zip code if zip code is invalid", () => {
    const zipCode = "00000000";
    const countryCode = "BR";
    expect(() =>
      AddressValidator.validateZipCode(zipCode, countryCode)
    ).toThrow(
      new ApplicationException(
        400,
        { message: "Zip Code is invalid" },
        "Zip Code is invalid"
      )
    );
  });

  it("should validate address", () => {
    const address: Address = {
      street: "Rua dos Bobos",
      streetNumber: "0",
      city: "São Paulo",
      state: "SP",
      countryCode: "BR",
      zipCode: "00000-000",
      latitude: 0,
      longitude: 0,
    };
    expect(() => AddressValidator.validate(address)).not.toThrow();
  });
});
