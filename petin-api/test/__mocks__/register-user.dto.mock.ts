import { faker } from '@faker-js/faker';
import { RegisterUserDto } from '../../src/users/dto/register-user.dto';
import { Intention, UserRole } from '../../src/users/entities/user.entity';
import { mockProfileDto } from './profile.dto.mock';

export const mockRegisterUserDto = (
  userRole: UserRole,
  intention: Intention,
) => {
  const dto = new RegisterUserDto();
  dto.name = faker.name.findName();
  dto.email = faker.internet.email();
  dto.role = userRole;
  dto.cpf = faker.random.numeric(11);
  dto.profile = mockProfileDto(intention);
  dto.password = faker.random.alphaNumeric();
  dto.confirmPassword = faker.random.alphaNumeric();
  return dto;
};
