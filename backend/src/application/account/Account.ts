import { Owner } from "../owner/Owner";

export type Account = {
  id?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  owner?: Owner;
  createdAt?: string;
  updatedAt?: string;
};
