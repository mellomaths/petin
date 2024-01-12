import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { IdParam } from '../utils/dto/id.param';
import { mockPetDto } from '../../test/__mocks__/pet.dto.mock';
import { mockRegisterPetDto } from '../../test/__mocks__/register-pet.dto.mock';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { mockRequest } from '../../test/__mocks__/request.mock';

describe('PetsController', () => {
  let controller: PetsController;
  let petsServiceMock: PetsService;

  beforeEach(async () => {
    petsServiceMock = {
      registerPet: jest.fn(),
      listPets: jest.fn(),
      likePet: jest.fn(),
    } as unknown as PetsService;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetsController],
      providers: [{ provide: PetsService, useValue: petsServiceMock }],
    }).compile();

    controller = module.get<PetsController>(PetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addPet', () => {
    it('should receive request to add Pet', async () => {
      const request = mockRequest();
      const petDto = mockRegisterPetDto();

      jest.spyOn(petsServiceMock, 'registerPet').mockResolvedValue({
        success: true,
        messages: ['Registered'],
        id: faker.datatype.uuid(),
      });

      const response = await controller.addPet(request, petDto);

      expect(response).toBeTruthy();
      expect(response.success).toBe(true);
      expect(response.messages[0]).toBe('Registered');
      expect(response.id).toBeTruthy();
    });
  });

  describe('listPets', () => {
    it('should receive request to list Pets', async () => {
      const request = mockRequest();

      const existingPet = mockPetDto();
      jest.spyOn(petsServiceMock, 'listPets').mockResolvedValue([existingPet]);

      const pets = await controller.listPets(request);

      expect(pets).toBeTruthy();
      expect(pets.length).toBe(1);
    });
  });

  describe('likePet', () => {
    it('should receive request to like Pet', async () => {
      const request = mockRequest();
      const params: IdParam = {
        id: faker.datatype.uuid(),
      };

      jest.spyOn(petsServiceMock, 'likePet').mockResolvedValue({
        success: true,
        messages: ['Liked'],
        id: faker.datatype.uuid(),
      });

      const response = await controller.likePet(request, params);

      expect(response).toBeTruthy();
      expect(response.success).toBe(true);
      expect(response.messages[0]).toBe('Liked');
      expect(response.id).toBeTruthy();
    });
  });
});
