import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../entities/pet.entity';

@Injectable()
export class GetPetByIdService {
  private readonly logger = new Logger(GetPetByIdService.name);

  constructor(
    @InjectRepository(Pet)
    private readonly petsRepository: Repository<Pet>,
  ) {}

  async execute(id: string): Promise<Pet> {
    this.logger.log(`Getting Pet by its ID. (id=${id}).`);

    const pet = await this.petsRepository.findOne({
      where: { uuid: id },
      relations: { user: true },
    });

    if (!pet) {
      this.logger.error(`Pet was not found`);
      throw new NotFoundException({
        success: false,
        messages: [`Pet was not found`],
      });
    }

    return pet;
  }
}
