import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pet } from '../entities/pet.entity';
import { Repository } from 'typeorm';
import { ListPetsService } from './list-pets.service';
import { mockPetEntity } from '../../../test/__mocks__/pet.entity.mock';

describe('ListPetsService', () => {
  let service: ListPetsService;
  let repository: Repository<Pet>;

  beforeEach(async () => {
    repository = {
      find: jest.fn(),
    } as unknown as Repository<Pet>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPetsService,
        { provide: getRepositoryToken(Pet), useValue: repository },
      ],
    }).compile();

    service = module.get<ListPetsService>(ListPetsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    let existingPetList: Pet[];

    beforeEach(() => {
      existingPetList = [];
      existingPetList.push(mockPetEntity());
      existingPetList.push(mockPetEntity());
      jest.spyOn(repository, 'find').mockResolvedValueOnce(existingPetList);
    });

    it('should list pets for a user', async () => {
      const userId = faker.datatype.uuid();
      const pets = await service.execute(userId);
      expect(pets).toBeDefined();
      expect(pets.length).toEqual(2);

      expect(repository.find).toBeCalledWith({
        where: { user: { uuid: userId } },
        relations: { likes: { user: { profile: true } } },
      });
    });
  });
});
