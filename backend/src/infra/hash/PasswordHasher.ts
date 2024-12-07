import { LoginPasswordHasher } from "../../application/account/usecase/Login";
import { SignupPasswordHasher } from "../../application/account/usecase/Signup";

export interface PasswordHasher
  extends SignupPasswordHasher,
    LoginPasswordHasher {}
