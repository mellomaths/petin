import { ApiProperty } from '@nestjs/swagger';
import { Pet, PetSex, PetType } from '../entities/pet.entity';

export class PetDto {
  @ApiProperty({ required: true })
  id: string;

  @ApiProperty({ required: true })
  ownerId: string;

  @ApiProperty({ required: true })
  name: string;

  @ApiProperty({ required: true })
  birthday: string;

  @ApiProperty({ required: true, enum: PetType })
  type: string;

  @ApiProperty({ required: true })
  bio: string;

  @ApiProperty({ required: true, enum: PetSex })
  sex: string;

  @ApiProperty({ required: true, isArray: true })
  photos: { url: string }[];

  @ApiProperty({ required: true })
  createdAt: string;

  static fromPetEntity(entity: Pet): PetDto {
    const dto = new PetDto();
    dto.id = entity.uuid;
    dto.ownerId = entity.owner.uuid;
    dto.name = entity.name;
    dto.birthday = entity.birthday;
    dto.type = entity.type;
    dto.bio = entity.bio;
    dto.sex = entity.sex;
    dto.photos = [];
    if (entity.photos && entity.photos.length > 0) {
      entity.photos.map((photo) => ({
        url: photo.url,
      }));
    }
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
