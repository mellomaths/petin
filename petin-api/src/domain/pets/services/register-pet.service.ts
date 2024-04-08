import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pet } from '../entities/pet.entity';
import { Repository } from 'typeorm';
import { RegisterPetDto } from '../dto/register-pet.dto';
import { GetUserByIdService } from 'src/domain/users/services/get-user-by-id.service';

@Injectable()
export class RegisterPetService {
  private readonly logger = new Logger(RegisterPetService.name);

  constructor(
    @InjectRepository(Pet)
    private readonly petsRepository: Repository<Pet>,
    private readonly getUserByIdService: GetUserByIdService,
  ) {}
  async execute(userId: string, petDto: RegisterPetDto): Promise<Pet> {
    this.logger.log(`Registering pet`);
    const user = await this.getUserByIdService.execute(userId);
    if (!user) {
      this.logger.error(`User id='${userId}' was not found`);
      throw new NotFoundException({
        success: false,
        messages: [`User was not found`],
      });
    }

    let pet = Pet.fromRegisterPetDto(petDto);
    pet.owner = user;
    pet = await this.petsRepository.save(pet);
    this.logger.log(
      `Pet successfully registered (id=${pet.id}) (uuid=${pet.uuid})`,
    );
    return pet;
  }
}
