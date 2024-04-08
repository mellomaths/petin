import { ApiProperty } from '@nestjs/swagger';
import { Photo } from '../entities/photo.entity';

export class PhotoDto {
  @ApiProperty({ required: true })
  id: string;

  @ApiProperty({ required: true })
  petId: string;

  @ApiProperty({ required: true })
  url: string;

  @ApiProperty({ required: true })
  createdAt: string;

  static fromPhotoEntity(entity: Photo): PhotoDto {
    const dto = new PhotoDto();
    dto.id = entity.uuid;
    dto.petId = entity.pet.uuid;
    dto.url = entity.url;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
