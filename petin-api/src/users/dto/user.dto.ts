import { User } from '../entities/user.entity';
import { ProfileDto } from './profile.dto';

export class UserDto {
  id: string;
  name: string;
  role: string;
  birthday: string;
  cpf: string;
  email: string;
  profile: ProfileDto;
  createdAt: string;

  static fromUserEntity(entity: User): UserDto {
    const dto = new UserDto();
    dto.id = entity.uuid;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.role = entity.role;
    dto.birthday = entity.birthday;
    dto.cpf = entity.cpf;
    if (entity.profile) {
      dto.profile = ProfileDto.fromProfileEntity(entity.profile);
    }
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
