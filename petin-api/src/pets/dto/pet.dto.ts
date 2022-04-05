import { ApiProperty } from '@nestjs/swagger';
import { AgeType, Pet, Species } from '../entities/pet.entity';
import { LikeDto } from './like.dto';

export class PetDto {
  @ApiProperty({ required: true })
  id: string;

  @ApiProperty({ required: true })
  name: string;

  @ApiProperty({ required: true })
  description: string;

  @ApiProperty({ required: true })
  photo: string;

  @ApiProperty({ required: true })
  age: number;

  @ApiProperty({ required: true, enum: AgeType })
  ageType: string;

  @ApiProperty({ required: true, enum: Species })
  species: string;

  @ApiProperty({ required: false, isArray: true })
  likes: LikeDto[];

  @ApiProperty({ required: true })
  createdAt: string;

  static fromPetEntity(entity: Pet): PetDto {
    const dto = new PetDto();
    dto.id = entity.uuid;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.photo = entity.photo;
    dto.age = entity.age;
    dto.ageType = entity.ageType;
    dto.species = entity.species;
    dto.likes = entity.likes.map((like) => LikeDto.fromLikeEntity(like));
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
