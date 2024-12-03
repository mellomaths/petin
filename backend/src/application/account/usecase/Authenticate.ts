import { Inject } from "../../../infra/di/DependencyInjection";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { Account } from "../Account";
import { TokenPayload } from "../TokenPayload";

export class Authenticate {
  @Inject("AccountsRepository")
  accountsRepository: AuthenticateRepository;

  @Inject("TokenGenerator")
  tokenGenerator: AuthenticateTokenGenerator;

  async execute(token: string): Promise<Account> {
    if (!token) {
      throw new ApplicationException(
        401,
        { message: "Unauthorized" },
        "Unauthorized"
      );
    }
    const decoded = this.tokenGenerator.verify(token);
    if (!decoded) {
      throw new ApplicationException(
        401,
        { message: "Unauthorized" },
        "Unauthorized"
      );
    }
    const account = await this.accountsRepository.get(decoded.accountId);
    if (!account) {
      throw new ApplicationException(
        401,
        { message: "Unauthorized" },
        "Unauthorized"
      );
    }
    account.password = "";
    return account;
  }
}

export interface AuthenticateRepository {
  get(accountId: string): Promise<Account | null>;
}

export interface AuthenticateTokenGenerator {
  verify(token: string): TokenPayload;
}
