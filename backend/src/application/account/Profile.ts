export type Profile = {
  id?: string;
  accountId?: string;
  fullname: string;
  documentNumber: string;
  birthdate: string;
  bio: string;
  gender: string;
  phoneNumber: string;
  addressId?: string;
  address: Address;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Address = {
  id?: string;
  profileId?: string;
  street: string;
  streetNumber: string;
  city: string;
  state: string;
  countryCode: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
  updatedAt?: string;
};

export enum Gender {
  MAN = "MAN",
  WOMAN = "WOMAN",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

export enum CountryCode {
  BRAZIL = "BR",
}
