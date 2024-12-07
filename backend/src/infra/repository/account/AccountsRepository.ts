import { LoginRepository } from "../../../application/account/usecase/Login";
import { SignupRepository } from "../../../application/account/usecase/Signup";
import { CreateReportAccountRepository } from "../../../application/report/usecase/CreateReport";

export interface AccountsRepository
  extends LoginRepository,
    SignupRepository,
    CreateReportAccountRepository {}
