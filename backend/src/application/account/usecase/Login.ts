import { Inject } from "../../../infra/di/DependencyInjection";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { Account } from "../Account";

export class Login {
  @Inject("AccountsRepository")
  accountsRepository: LoginRepository;

  @Inject("PasswordHasher")
  passwordHasher: LoginPasswordHasher;

  @Inject("JwtService")
  jwtService: LoginJwtService;

  async execute(email: string, password: string) {
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
    const expirationTimeInSeconds = 3600;
    const token = this.jwtService.generate(
      {
        sub: account.id!,
        owner_id: account.id!,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expirationTimeInSeconds,
      },
      expirationTimeInSeconds
    );
    return token;
  }
}

export interface LoginRepository {
  getByEmail(email: string): Promise<Account | null>;
}

export interface LoginPasswordHasher {
  compare(password: string, hash: string): Promise<boolean>;
}

export interface LoginJwtService {
  generate(payload: any, expirationTimeInSeconds: number): string;
}
