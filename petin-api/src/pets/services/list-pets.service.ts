import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../entities/pet.entity';

@Injectable()
export class ListPetsService {
  private readonly logger = new Logger(ListPetsService.name);

  constructor(
    @InjectRepository(Pet)
    private readonly petsRepository: Repository<Pet>,
  ) {}

  async execute(userId: string): Promise<Pet[]> {
    this.logger.log(`Listing pets (userId=${userId})`);
    const pets = await this.petsRepository.find({
      where: { user: { uuid: userId } },
      relations: { likes: { user: { profile: true } } },
    });
    return pets;
  }
}
