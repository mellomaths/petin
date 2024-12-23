import { Profile } from "../account/Profile";

export type Pet = {
  id?: string;
  ownerAccountId?: string;
  ownerAccountProfile?: Profile;
  name: string;
  birthday: string;
  bio: string;
  sex: string;
  type: string;
  donation: boolean;
  adopted: boolean;
  archived: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export enum Animal {
  DOG = "DOG",
  CAT = "CAT",
  BIRD = "BIRD",
  FISH = "FISH",
}

export enum Sex {
  MALE = "MALE",
  FEMALE = "FEMALE",
}
