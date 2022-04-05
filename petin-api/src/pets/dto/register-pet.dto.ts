import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { IsValidAge } from '../../utils/validator/is-valid-age.validator';
import { AgeType, Species } from '../entities/pet.entity';

export class RegisterPetDto {
  @IsString()
  @ApiProperty({ required: false })
  name?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  photo: string;

  @IsNumber()
  @IsInt()
  @IsDefined()
  @Min(0)
  @IsValidAge('ageType')
  @ApiProperty({ required: true, minimum: 0 })
  age: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(AgeType)
  @ApiProperty({ required: true, enum: AgeType })
  ageType: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Species)
  @ApiProperty({ required: true, enum: Species })
  species: string;
}
