export type Pet = {
  id?: string;
  owner_id?: string;
  name: string;
  birthday: string;
  bio: string;
  sex: string;
  type: string;
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
