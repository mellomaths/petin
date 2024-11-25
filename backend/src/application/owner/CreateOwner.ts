import { Inject } from "../../infra/di/DependencyInjection";
import { ApplicationException } from "../../infra/exception/ApplicationException";
import { Owner } from "./Owner";
import { OwnerValidator } from "./OwnerValidator";

export class CreateOwner {
  @Inject("OwnersRepository")
  ownersRepository: CreateOwnerRepository;

  @Inject("PasswordHasher")
  passwordHasher: PasswordHasher;

  async execute(owner: Owner) {
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
    owner.password = await this.passwordHasher.hash(owner.password);
    return await this.ownersRepository.create(owner);
  }
}

export interface CreateOwnerRepository {
  getByEmail(email: string): Promise<Owner>;
  create(owner: Owner): Promise<void>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
