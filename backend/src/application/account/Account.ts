import { Profile } from "./Profile";

export type Account = {
  id?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  profile?: Profile;
  createdAt?: string;
  updatedAt?: string;
};
