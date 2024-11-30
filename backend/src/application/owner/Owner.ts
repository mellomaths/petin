export type Owner = {
  id?: string;
  accountId: string;
  fullname: string;
  documentNumber: string;
  birthday: string;
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
  ownerId?: string;
  street: string;
  streetNumber: string;
  city: string;
  state: string;
  countryCode: string;
  zipCode: string;
  // latitude: string;
  // longitude: string;

  createdAt?: string;
  updatedAt?: string;
};

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

export enum CountryCode {
  BRAZIL = "BR",
}
