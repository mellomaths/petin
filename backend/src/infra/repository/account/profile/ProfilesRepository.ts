import { CreateProfileRepository } from "../../../../application/account/usecase/CreateProfile";
import { GetProfileRepository } from "../../../../application/account/usecase/GetProfile";

export interface ProfilesRepository
  extends CreateProfileRepository,
    GetProfileRepository {}
