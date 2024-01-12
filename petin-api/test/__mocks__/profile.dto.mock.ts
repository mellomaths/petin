import { faker } from '@faker-js/faker';
import { ProfileDto } from '../../src/domain/users/dto/profile.dto';
import { UserGender } from '../../src/domain/users/entities/profile.entity';
import { Intention } from '../../src/domain/users/entities/user.entity';

export const mockProfileDto = (intention: Intention) => {
  const dto = new ProfileDto();
  dto.birthday = faker.date.birthdate().toDateString();
  dto.bio = faker.lorem.text();
  dto.gender = faker.helpers.arrayElement(Object.values(UserGender));
  dto.photo = faker.image.avatar();
  dto.intention = intention;
  return dto;
};
