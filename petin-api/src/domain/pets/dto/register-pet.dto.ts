import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import { PetSex, PetType } from '../entities/pet.entity';

export class RegisterPetDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  name: string;

  @IsISO8601()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  birthday: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(PetType)
  @ApiProperty({ required: true, enum: PetType })
  type: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  bio: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(PetSex)
  @ApiProperty({ required: true, enum: PetSex })
  sex: string;
}
