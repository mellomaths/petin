import { PetDto } from '../../src/pets/dto/pet.dto';
import { mockPetEntity } from './pet.entity.mock';

export const mockPetDto = () => {
  const entity = mockPetEntity();
  return PetDto.fromPetEntity(entity);
};
