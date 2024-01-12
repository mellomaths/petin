import { ApiProperty } from '@nestjs/swagger';
import { User, UserRole } from '../entities/user.entity';
import { ProfileDto } from './profile.dto';

export class UserDto {
  @ApiProperty({ required: true })
  id: string;

  @ApiProperty({ required: true })
  name: string;

  @ApiProperty({ required: true, enum: UserRole })
  role: string;

  @ApiProperty({ required: true })
  birthday: string;

  @ApiProperty({ required: true })
  cpf: string;

  @ApiProperty({ required: true })
  email: string;

  @ApiProperty({ required: true })
  profile: ProfileDto;

  @ApiProperty({ required: true })
  createdAt: string;

  static fromUserEntity(entity: User): UserDto {
    const dto = new UserDto();
    dto.id = entity.uuid;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.role = entity.role;
    dto.cpf = entity.cpf;
    if (entity.profile) {
      dto.profile = ProfileDto.fromProfileEntity(entity.profile);
    }
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
