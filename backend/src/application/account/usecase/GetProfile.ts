import { Inject } from "../../../infra/di/DependencyInjection";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { Pet } from "../../pet/Pet";
import { Profile } from "../Profile";
import { ProfileExpanded } from "../ProfileExpanded";
import { Authenticate } from "./Authenticate";

export class GetProfile {
  @Inject("Authenticate")
  authenticate: Authenticate;

  @Inject("ProfilesRepository")
  profilesRepository: GetProfileRepository;

  @Inject("PetsRepository")
  petsRepository: GetProfilePetsRepository;

  async execute(
    token: string,
    expands: string[] = []
  ): Promise<ProfileExpanded> {
    const account = await this.authenticate.execute(token);
    const profile = await this.profilesRepository.getByAccountId(account.id!);
    if (!profile) {
      throw new ApplicationException(
        404,
        { message: "Profile not registred" },
        "Profile not registred"
      );
    }

    let pets: Pet[] = [];
    if (expands.includes("pets")) {
      pets = await this.petsRepository.listByAccountId(account.id!);
    }

    return {
      profile,
      pets,
    };
  }
}

export interface GetProfileRepository {
  getByAccountId(accountId: string): Promise<Profile | null>;
}

export interface GetProfilePetsRepository {
  listByAccountId(accountId: string): Promise<Pet[]>;
}
