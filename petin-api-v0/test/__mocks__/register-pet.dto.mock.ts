import { faker } from '@faker-js/faker';
import { AgeType, Species } from '../../src/pets/entities/pet.entity';
import { RegisterPetDto } from '../../src/pets/dto/register-pet.dto';

export const mockRegisterPetDto = () => {
  const dto = new RegisterPetDto();
  dto.name = faker.name.firstName();
  dto.description = faker.lorem.text();
  dto.photo = faker.image.avatar();
  dto.age = faker.datatype.number();
  dto.ageType = faker.helpers.arrayElement(Object.values(AgeType));
  dto.species = faker.helpers.arrayElement(Object.values(Species));
  return dto;
};
