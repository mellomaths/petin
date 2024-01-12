import { Injectable, Logger } from '@nestjs/common';
import { ApiResponseDto } from '../infrastructure/api/api-response.dto';
import { PetDto } from './dto/pet.dto';
import { RegisterPetDto } from './dto/register-pet.dto';
import { LikePetService } from './services/like-pet.service';
import { ListPetsService } from './services/list-pets.service';
import { RegisterPetService } from './services/register-pet.service';

@Injectable()
export class PetsService {
  private readonly logger = new Logger(PetsService.name);

  constructor(
    private readonly registerPetService: RegisterPetService,
    private readonly listPetsService: ListPetsService,
    private readonly likePetService: LikePetService,
  ) {}

  async registerPet(
    userId: string,
    petDto: RegisterPetDto,
  ): Promise<ApiResponseDto> {
    const pet = await this.registerPetService.execute(userId, petDto);
    return {
      success: true,
      messages: [`Pet successfully registered.`],
      id: pet.uuid,
    };
  }

  async listPets(userId: string): Promise<PetDto[]> {
    const pets = await this.listPetsService.execute(userId);
    return pets.map((pet) => PetDto.fromPetEntity(pet));
  }

  async likePet(userId: string, petId: string): Promise<ApiResponseDto> {
    const like = await this.likePetService.execute(userId, petId);
    return {
      success: true,
      messages: [`Like registered.`],
      id: like.uuid,
    };
  }
}
