import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Like } from './entities/like.entity';
import { Pet } from './entities/pet.entity';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { GetPetByIdService } from './services/get-pet-by-id.service';
import { LikePetService } from './services/like-pet.service';
import { ListPetsService } from './services/list-pets.service';
import { RegisterPetService } from './services/register-pet.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, Like]), UsersModule],
  controllers: [PetsController],
  providers: [
    PetsService,
    RegisterPetService,
    ListPetsService,
    GetPetByIdService,
    LikePetService,
  ],
  exports: [
    PetsService,
    RegisterPetService,
    ListPetsService,
    GetPetByIdService,
    LikePetService,
  ],
})
export class PetsModule {}
