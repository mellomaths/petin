import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pet } from '../entities/pet.entity';
import { Repository } from 'typeorm';
import { mockPetEntity } from '../../../test/__mocks__/pet.entity.mock';
import { GetPetByIdService } from './get-pet-by-id.service';
import { NotFoundException } from '@nestjs/common';

describe('GetPetByIdService', () => {
  let service: GetPetByIdService;
  let repository: Repository<Pet>;

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
    } as unknown as Repository<Pet>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPetByIdService,
        { provide: getRepositoryToken(Pet), useValue: repository },
      ],
    }).compile();

    service = module.get<GetPetByIdService>(GetPetByIdService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    let existingPet: Pet;

    beforeEach(() => {
      existingPet = mockPetEntity();
      jest.spyOn(repository, 'findOne').mockResolvedValue(existingPet);
    });

    it('should find pet by its id', async () => {
      const petId = faker.datatype.uuid();
      const pet = await service.execute(petId);
      expect(pet).toBeDefined();

      expect(repository.findOne).toBeCalledWith({
        where: { uuid: petId },
        relations: { user: true },
      });
    });

    it('should throw NotFoundException if there are no Pet with this id', async () => {
      const petId = faker.datatype.uuid();

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.execute(petId)).rejects.toThrow(NotFoundException);
    });
  });
});
