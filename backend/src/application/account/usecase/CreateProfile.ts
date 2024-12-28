import { Inject } from "../../../infra/di/DependencyInjection";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { Profile } from "../Profile";
import { Authenticate } from "./Authenticate";
import { CheckDocumentNumber } from "./CheckDocumentNumber";
import { CheckZipCode } from "./CheckZipCode";

export class CreateProfile {
  @Inject("ProfilesRepository")
  profilesRepository: CreateProfileRepository;

  @Inject("Authenticate")
  authenticate: Authenticate;

  @Inject("CheckDocumentNumber")
  checkDocumentNumber: CheckDocumentNumber;

  @Inject("CheckZipCode")
  checkZipCode: CheckZipCode;

  async execute(
    token: string,
    profile: Profile
  ): Promise<{ profileId: string }> {
    const account = await this.authenticate.execute(token);
    const existingProfile = await this.profilesRepository.getByAccountId(
      account.id!
    );
    if (existingProfile) {
      throw new ApplicationException(
        400,
        { message: "Profile already exists" },
        "Profile already exists"
      );
    }
    const isValidDocumentNumber = await this.checkDocumentNumber.execute(
      profile.documentNumber,
      profile.documentNumberType,
      profile.address.countryCode
    );
    if (!isValidDocumentNumber) {
      throw new ApplicationException(
        400,
        { message: "Invalid document number" },
        "Invalid document number"
      );
    }
    const isValidZipCode = await this.checkZipCode.execute({
      zipCode: profile.address.zipCode,
      countryCode: profile.address.countryCode,
    });
    if (!isValidZipCode) {
      throw new ApplicationException(
        400,
        { message: "Invalid zip code" },
        "Invalid zip code"
      );
    }
    profile.id = crypto.randomUUID();
    profile.accountId = account.id!;
    profile.createdAt = new Date().toISOString();
    profile.updatedAt = new Date().toISOString();
    profile.address.profileId = profile.id;
    profile.address.id = crypto.randomUUID();
    profile.address.createdAt = new Date().toISOString();
    profile.address.updatedAt = new Date().toISOString();
    await this.profilesRepository.create(profile);
    return { profileId: profile.id };
  }
}

export interface CreateProfileRepository {
  getByAccountId(accountId: string): Promise<Profile | null>;
  create(profile: Profile): Promise<void>;
}
