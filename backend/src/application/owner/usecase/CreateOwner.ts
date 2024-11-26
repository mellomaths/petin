import { Inject } from "../../../infra/di/DependencyInjection";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { Account } from "../../account/Account";
import { Owner } from "../Owner";
import { OwnerValidator } from "../validator/OwnerValidator";

export class CreateOwner {
  @Inject("OwnersRepository")
  ownersRepository: CreateOwnerRepository;

  @Inject("AccountsRepository")
  accountsRepository: CreateOwnerAccountsRepository;

  @Inject("PasswordHasher")
  passwordHasher: CreateOwnerPasswordHasher;

  async execute(owner: Owner): Promise<{ owner_id: string }> {
    OwnerValidator.validate(owner);
    const account = await this.accountsRepository.get(owner.accountId);
    if (!account) {
      throw new ApplicationException(
        400,
        { message: "Account not created" },
        "Account not created"
      );
    }
    owner.id = crypto.randomUUID();
    owner.createdAt = new Date().toISOString();
    owner.updatedAt = new Date().toISOString();
    owner.address.ownerId = owner.id;
    owner.address.id = crypto.randomUUID();
    owner.address.createdAt = new Date().toISOString();
    owner.address.updatedAt = new Date().toISOString();
    await this.ownersRepository.create(owner);
    return { owner_id: owner.id };
  }
}

export interface CreateOwnerRepository {
  getByEmail(email: string): Promise<Owner | null>;
  create(owner: Owner): Promise<void>;
}

export interface CreateOwnerAccountsRepository {
  get(accountId: string): Promise<Account | null>;
}

export interface CreateOwnerPasswordHasher {
  hash(password: string): Promise<string>;
}
