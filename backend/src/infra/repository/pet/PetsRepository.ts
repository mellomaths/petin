import { GetProfilePetsRepository } from "../../../application/account/usecase/GetProfile";
import { CreatePetRepository } from "../../../application/pet/usecase/CreatePet";
import { ListPetsRepository } from "../../../application/pet/usecase/ListPets";
import { CreateReportPetsRepository } from "../../../application/report/usecase/CreateReport";

export interface PetsRepository
  extends CreatePetRepository,
    ListPetsRepository,
    GetProfilePetsRepository,
    CreateReportPetsRepository {}
