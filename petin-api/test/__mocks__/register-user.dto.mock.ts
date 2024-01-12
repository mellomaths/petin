import { faker } from '@faker-js/faker';
import { RegisterUserDto } from '../../src/domain/users/dto/register-user.dto';
import {
  Intention,
  UserRole,
} from '../../src/domain/users/entities/user.entity';
import { mockProfileDto } from './profile.dto.mock';

export const mockRegisterUserDto = (
  userRole: UserRole,
  intention: Intention,
) => {
  const dto = new RegisterUserDto();
  dto.name = faker.person.fullName();
  dto.email = faker.internet.email();
  dto.role = userRole;
  dto.cpf = faker.string.numeric(11);
  dto.profile = mockProfileDto(intention);
  dto.password = faker.string.alphanumeric();
  dto.confirmPassword = faker.string.alphanumeric();
  return dto;
};
