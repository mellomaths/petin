import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GetUserByIdService } from '../../users/services/get-user-by-id.service';
import { mockRegisterPetDto } from '../../../test/__mocks__/register-pet.dto.mock';
import { Pet } from '../entities/pet.entity';
import { RegisterPetService } from './register-pet.service';
import { mockUserEntity } from '../../../test/__mocks__/user.entity.mock';
import { Intention, User, UserRole } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { UnprocessableEntityException } from '@nestjs/common';

describe('RegisterPetService', () => {
  let service: RegisterPetService;
  let repository: Repository<Pet>;
  let getUserByIdService: GetUserByIdService;

  beforeEach(async () => {
    getUserByIdService = {
      execute: jest.fn(),
    } as unknown as GetUserByIdService;
    repository = {
      save: jest.fn(),
    } as unknown as Repository<Pet>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterPetService,
        { provide: getRepositoryToken(Pet), useValue: repository },
        { provide: GetUserByIdService, useValue: getUserByIdService },
      ],
    }).compile();

    service = module.get<RegisterPetService>(RegisterPetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    let existingUser: User;
    beforeEach(() => {
      existingUser = mockUserEntity(UserRole.USER, Intention.DONATE);
      jest
        .spyOn(getUserByIdService, 'execute')
        .mockResolvedValueOnce(existingUser);
      jest
        .spyOn(repository, 'save')
        .mockImplementationOnce(async (entity: Pet) => entity);
    });

    it('should register new pet', async () => {
      const userId = faker.datatype.number().toString();
      const registerPetDto = mockRegisterPetDto();
      const pet = await service.execute(userId, registerPetDto);

      expect(pet).toBeTruthy();
      expect(pet.name).toBe(registerPetDto.name);
      expect(pet.description).toBe(registerPetDto.description);
    });

    it('should not allow user register Pet if their intention is to adopt one', async () => {
      const userId = faker.datatype.number().toString();
      const registerPetDto = mockRegisterPetDto();

      existingUser.profile.intention = Intention.ADOPT;
      jest
        .spyOn(getUserByIdService, 'execute')
        .mockResolvedValueOnce(existingUser);

      await expect(service.execute(userId, registerPetDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });
});
