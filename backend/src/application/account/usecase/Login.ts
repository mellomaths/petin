import { Inject } from "../../../infra/di/DependencyInjection";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { Account } from "../Account";
import { TokenPayload } from "../TokenPayload";

export class Login {
  @Inject("AccountsRepository")
  accountsRepository: LoginRepository;

  @Inject("PasswordHasher")
  passwordHasher: LoginPasswordHasher;

  @Inject("TokenGenerator")
  tokenGenerator: LoginAuthTokenGenerator;

  private readonly expirationTimeInSeconds = 3600;

  async execute(
    email: string,
    password: string
  ): Promise<{ token: string; expiresIn: number }> {
    const account = await this.accountsRepository.getByEmail(email);
    if (!account) {
      throw new ApplicationException(
        404,
        { message: "Account not found" },
        "Account not found"
      );
    }
    const passwordMatch = await this.passwordHasher.compare(
      password,
      account.password
    );
    if (!passwordMatch) {
      throw new ApplicationException(
        401,
        { message: "Invalid password" },
        "Invalid password"
      );
    }
    const token = this.tokenGenerator.generate(
      {
        sub: account.id!,
        accountId: account.id!,
      },
      this.expirationTimeInSeconds
    );
    return { token, expiresIn: this.expirationTimeInSeconds };
  }
}

export interface LoginRepository {
  getByEmail(email: string): Promise<Account | null>;
}

export interface LoginPasswordHasher {
  compare(password: string, hash: string): Promise<boolean>;
}

export interface LoginAuthTokenGenerator {
  generate(payload: TokenPayload, expirationTimeInSeconds: number): string;
}
