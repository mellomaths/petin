import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { IsEqualTo } from '../../utils/validator/is-equal.validator';
import { UserRole } from '../entities/user.entity';

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
  @ApiProperty({ required: true, maxLength: 11 })
  cpf: string;

  @IsISO8601()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  birthday: string;

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
