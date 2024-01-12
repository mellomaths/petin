import { faker } from '@faker-js/faker';
import { Profile } from '../../src/users/entities/profile.entity';
import { Intention } from '../../src/users/entities/user.entity';
import { mockProfileDto } from './profile.dto.mock';

export const mockProfileEntity = (intention: Intention) => {
  const dto = mockProfileDto(intention);
  const entity = new Profile();
  entity.id = faker.datatype.number();
  entity.uuid = faker.datatype.uuid();
  entity.birthday = dto.birthday;
  entity.bio = dto.bio;
  entity.gender = dto.gender;
  entity.photo = dto.photo;
  entity.intention = dto.intention;
  return entity;
};
