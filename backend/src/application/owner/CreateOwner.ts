import { Inject } from "../../infra/di/DependencyInjection";
import { ApplicationException } from "../../infra/exception/ApplicationException";
import { Owner } from "./Owner";
import { OwnerValidator } from "./OwnerValidator";

export class CreateOwner {
  @Inject("OwnersRepository")
  ownersRepository: CreateOwnerRepository;

  @Inject("PasswordHasher")
  passwordHasher: CreateOwnerPasswordHasher;

  async execute(owner: Owner): Promise<{ owner_id: string }> {
    OwnerValidator.validate(owner);
    if (await this.ownersRepository.getByEmail(owner.email)) {
      throw new ApplicationException(
        400,
        { message: "Email already in use" },
        "Email already in use"
      );
    }
    owner.id = crypto.randomUUID();
    owner.createdAt = new Date().toISOString();
    owner.updatedAt = new Date().toISOString();
    owner.address.ownerId = owner.id;
    owner.address.id = crypto.randomUUID();
    owner.address.createdAt = new Date().toISOString();
    owner.address.updatedAt = new Date().toISOString();
    owner.password = await this.passwordHasher.hash(owner.password);
    await this.ownersRepository.create(owner);
    return { owner_id: owner.id };
  }
}

export interface CreateOwnerRepository {
  getByEmail(email: string): Promise<Owner | null>;
  create(owner: Owner): Promise<void>;
}

export interface CreateOwnerPasswordHasher {
  hash(password: string): Promise<string>;
  // compare(password: string, hash: string): Promise<boolean>;
}
