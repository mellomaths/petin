import { faker } from '@faker-js/faker';
import { Pet } from '../../src/pets/entities/pet.entity';
import { mockRegisterPetDto } from './register-pet.dto.mock';

export const mockPetEntity = () => {
  const dto = mockRegisterPetDto();
  const entity = Pet.fromRegisterPetDto(dto);
  entity.id = faker.datatype.number();
  entity.uuid = faker.datatype.uuid();
  entity.createdAt = new Date().toUTCString();
  entity.likes = [];
  return entity;
};
