import { faker } from '@faker-js/faker';
import { ProfileDto } from '../../src/users/dto/profile.dto';
import { UserGender } from '../../src/users/entities/profile.entity';
import { Intention } from '../../src/users/entities/user.entity';

export const mockProfileDto = (intention: Intention) => {
  const dto = new ProfileDto();
  dto.birthday = faker.date.birthdate().toDateString();
  dto.bio = faker.lorem.text();
  dto.gender = faker.helpers.arrayElement(Object.values(UserGender));
  dto.photo = faker.image.avatar();
  dto.intention = intention;
  return dto;
};
