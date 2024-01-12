import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Intention } from '../../users/entities/user.entity';
import { GetUserByIdService } from '../../users/services/get-user-by-id.service';
import { Repository } from 'typeorm';
import { RegisterPetDto } from '../dto/register-pet.dto';
import { Pet } from '../entities/pet.entity';

@Injectable()
export class RegisterPetService {
  private readonly logger = new Logger(RegisterPetService.name);

  constructor(
    private readonly getUserByIdService: GetUserByIdService,
    @InjectRepository(Pet)
    private readonly petsRepository: Repository<Pet>,
  ) {}

  async execute(userId: string, petDto: RegisterPetDto) {
    this.logger.log(`Adding pet (userId=${userId})`);
    const user = await this.getUserByIdService.execute(userId);
    const { intention } = user.profile;
    if (
      intention !== Intention.DONATE &&
      intention !== Intention.DONATE_AND_ADOPT
    ) {
      this.logger.error(
        `User intention is ${intention}, so they can't send likes to Pets.`,
      );
      throw new UnprocessableEntityException({
        success: false,
        messages: [
          `User intention must be ${Intention.DONATE} or ${Intention.DONATE_AND_ADOPT} to add Pets.`,
        ],
      });
    }

    let pet = Pet.fromRegisterPetDto(petDto);
    pet.user = user;
    pet = await this.petsRepository.save(pet);
    this.logger.log(
      `Pet successfully added (id=${pet.id}) (uuid=${pet.uuid}) (userId=${userId})`,
    );
    return pet;
  }
}
