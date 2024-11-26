import { AuthenticateTokenGenerator } from "../../application/account/usecase/Authenticate";
import { LoginAuthTokenGenerator } from "../../application/account/usecase/Login";

export interface AuthTokenGenerator
  extends LoginAuthTokenGenerator,
    AuthenticateTokenGenerator {}
