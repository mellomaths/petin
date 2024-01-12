export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  sub: string;
  token: string;
  expirationTime: number;
  creationDate?: string;
};
