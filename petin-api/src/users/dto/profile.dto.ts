import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Gender, Profile } from '../entities/profile.entity';

export class ProfileDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  bio: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Gender)
  @ApiProperty({ required: true, enum: Gender })
  gender: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  photo: string;

  static fromProfileEntity(entity: Profile) {
    const dto = new ProfileDto();
    dto.bio = entity.bio;
    dto.gender = entity.gender;
    dto.photo = entity.photo;
    return dto;
  }
}
