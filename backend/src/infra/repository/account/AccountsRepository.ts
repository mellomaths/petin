import { LoginRepository } from "../../../application/account/usecase/Login";
import { SignupRepository } from "../../../application/account/usecase/Signup";
import { CreateOwnerAccountsRepository } from "../../../application/owner/usecase/CreateOwner";

export interface AccountsRepository
  extends LoginRepository,
    SignupRepository,
    CreateOwnerAccountsRepository {}
