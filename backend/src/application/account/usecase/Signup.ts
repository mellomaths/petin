import { Inject } from "../../../infra/di/DependencyInjection";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { CreateNewId } from "../../id/usecase/CreateNewId";
import { Account } from "../Account";
import { AccountValidator } from "../validator/AccountValidator";

export class Signup {
  @Inject("AccountsRepository")
  accountsRepository: SignupRepository;

  @Inject("PasswordHasher")
  passwordHasher: SignupPasswordHasher;

  @Inject("CreateNewId")
  createNewId: CreateNewId;

  async execute(account: Account): Promise<{ accountId: string }> {
    AccountValidator.validate(account);
    const existingAccount = await this.accountsRepository.getByEmail(
      account.email
    );
    if (existingAccount) {
      throw new ApplicationException(
        409,
        { message: "Account already exists" },
        "Account already exists"
      );
    }
    account.id = await this.createNewId.execute();
    account.createdAt = new Date().toISOString();
    account.updatedAt = new Date().toISOString();
    const hashedPassword = await this.passwordHasher.hash(account.password);
    account.password = hashedPassword;
    await this.accountsRepository.create(account);
    return { accountId: account.id };
  }
}

export interface SignupRepository {
  getByEmail(email: string): Promise<Account | null>;
  create(account: Account): Promise<void>;
}

export interface SignupPasswordHasher {
  hash(password: string): Promise<string>;
}
