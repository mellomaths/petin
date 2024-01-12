import { faker } from '@faker-js/faker';
import {
  Intention,
  User,
  UserRole,
} from '../../src/domain/users/entities/user.entity';
import { mockProfileEntity } from './profile.entity.mock';
import { mockRegisterUserDto } from './register-user.dto.mock';

export const mockUserEntity = (userRole: UserRole, intention: Intention) => {
  const dto = mockRegisterUserDto(userRole, intention);
  const entity = new User();
  entity.id = faker.number.int();
  entity.uuid = faker.string.uuid();
  entity.name = dto.name;
  entity.email = dto.email;
  entity.role = dto.role;
  entity.cpf = dto.cpf;
  entity.profile = mockProfileEntity(intention);
  entity.password = dto.password;
  entity.createdAt = new Date().toUTCString();
  return entity;
};
