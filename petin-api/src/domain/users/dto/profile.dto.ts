import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import { UserGender, Profile } from '../entities/profile.entity';
import { Intention } from '../entities/user.entity';

export class ProfileDto {
  @IsISO8601()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  birthday: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  bio: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(UserGender)
  @ApiProperty({ required: true, enum: UserGender })
  gender: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  photo: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Intention)
  @ApiProperty({ required: true, enum: Intention })
  intention: string;

  static fromProfileEntity(entity: Profile) {
    const dto = new ProfileDto();
    dto.birthday = entity.birthday;
    dto.bio = entity.bio;
    dto.gender = entity.gender;
    dto.photo = entity.photo;
    dto.intention = entity.intention;
    return dto;
  }
}
