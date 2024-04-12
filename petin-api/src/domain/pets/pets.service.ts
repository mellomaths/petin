import { Injectable, Logger } from '@nestjs/common';
import { RegisterPetService } from './services/register-pet.service';
import { PetDto } from './dto/pet.dto';
import { RegisterPetDto } from './dto/register-pet.dto';
import { ListPetsService } from './services/list-pets.service';

@Injectable()
export class PetsService {
  private readonly logger = new Logger(PetsService.name);

  constructor(
    private readonly registerPetService: RegisterPetService,
    private readonly listPetsService: ListPetsService,
  ) {}

  async registerPet(userId: string, petDto: RegisterPetDto): Promise<PetDto> {
    const pet = await this.registerPetService.execute(userId, petDto);
    return PetDto.fromPetEntity(pet);
  }

  async listPets(userId: string): Promise<PetDto[]> {
    const petsList = await this.listPetsService.execute(userId);
    return petsList.map((pet) => PetDto.fromPetEntity(pet));
  }
}
