import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pet } from '../entities/pet.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ListPetsService {
  private readonly logger = new Logger(ListPetsService.name);

  constructor(
    @InjectRepository(Pet)
    private readonly petsRepository: Repository<Pet>,
  ) {}

  async execute(ownerId: string): Promise<Pet[]> {
    this.logger.log(`Listing pets`);

    const petsList = await this.petsRepository.find({
      where: { owner: { uuid: ownerId } },
    });
    console.log(petsList);
    return petsList;
  }
}
