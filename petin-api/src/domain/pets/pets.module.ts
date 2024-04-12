import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pet } from './entities/pet.entity';
import { Photo } from './entities/photo.entity';
import { PetsService } from './pets.service';
import { RegisterPetService } from './services/register-pet.service';
import { PetsController } from './pets.controller';
import { UsersModule } from '../users/users.module';
import { ListPetsService } from './services/list-pets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, Photo]), UsersModule],
  providers: [RegisterPetService, ListPetsService, PetsService],
  exports: [PetsService],
  controllers: [PetsController],
})
export class PetsModule {}
