import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IsEqualTo } from '../../../utils/validators/is-equal.validator';
import { UserRole } from '../entities/user.entity';
import { ProfileDto } from './profile.dto';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ required: true, format: 'email@email.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(UserRole)
  @ApiProperty({ required: true, enum: UserRole })
  role: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(11)
  @ApiProperty({ required: true, maxLength: 11 })
  cpf: string;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @ApiProperty({ required: true })
  profile: ProfileDto;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({ required: true, minLength: 8 })
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsEqualTo('password')
  @ApiProperty({ required: true, description: 'Must match password field' })
  confirmPassword: string;
}
