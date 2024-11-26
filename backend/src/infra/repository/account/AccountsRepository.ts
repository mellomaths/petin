import { LoginRepository } from "../../../application/account/usecase/Login";
import { SignupRepository } from "../../../application/account/usecase/Signup";

export interface AccountsRepository extends LoginRepository, SignupRepository {}
