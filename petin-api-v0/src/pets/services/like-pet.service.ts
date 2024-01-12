import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Intention } from '../../users/entities/user.entity';
import { GetUserByIdService } from '../../users/services/get-user-by-id.service';
import { Repository } from 'typeorm';
import { Like } from '../entities/like.entity';
import { GetPetByIdService } from './get-pet-by-id.service';

@Injectable()
export class LikePetService {
  private readonly logger = new Logger(LikePetService.name);

  constructor(
    private readonly getUserByIdService: GetUserByIdService,
    private readonly getPetByIdService: GetPetByIdService,
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
  ) {}

  async execute(userId: string, petId: string) {
    const user = await this.getUserByIdService.execute(userId);
    if (!user) {
      this.logger.error(`User id='${userId}' was not found`);
      throw new NotFoundException({
        success: false,
        messages: [`User was not found`],
      });
    }

    const { intention } = user.profile;
    if (
      intention !== Intention.ADOPT &&
      intention !== Intention.DONATE_AND_ADOPT
    ) {
      this.logger.error(
        `User intention is ${intention}, so they can't send likes to Pets.`,
      );
      throw new UnprocessableEntityException({
        success: false,
        messages: [
          `User intention must be ${Intention.ADOPT} or ${Intention.DONATE_AND_ADOPT} to be able to send likes to Pets.`,
        ],
      });
    }

    const pet = await this.getPetByIdService.execute(petId);
    if (!pet) {
      this.logger.error(`Pet id='${petId}' was not found`);
      throw new NotFoundException({
        success: false,
        messages: [`Pet was not found`],
      });
    }

    if (pet.user.id === user.id) {
      this.logger.error(
        `User liking the Pet is the owner of the Pet. The user can't like their own pet.`,
      );
      throw new UnprocessableEntityException({
        success: false,
        messages: [`The User can't send likes to their own Pet.`],
      });
    }

    let like = new Like();
    like.user = user;
    like.pet = pet;
    like = await this.likesRepository.save(like);
    return like;
  }
}
