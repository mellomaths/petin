import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pet } from '../entities/pet.entity';
import { Repository } from 'typeorm';
import { mockPetEntity } from '../../../test/__mocks__/pet.entity.mock';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { LikePetService } from './like-pet.service';
import { Like } from '../entities/like.entity';
import { GetUserByIdService } from '../../users/services/get-user-by-id.service';
import { GetPetByIdService } from './get-pet-by-id.service';
import { Intention, User, UserRole } from '../../users/entities/user.entity';
import { mockUserEntity } from '../../../test/__mocks__/user.entity.mock';

describe('LikePetService', () => {
  let service: LikePetService;

  let repository: Repository<Like>;
  let getUserByIdServiceMock: GetUserByIdService;
  let getPetByIdServiceMock: GetPetByIdService;

  beforeEach(async () => {
    repository = {
      save: jest.fn(),
    } as unknown as Repository<Like>;
    getUserByIdServiceMock = {
      execute: jest.fn(),
    } as unknown as GetUserByIdService;
    getPetByIdServiceMock = {
      execute: jest.fn(),
    } as unknown as GetPetByIdService;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikePetService,
        { provide: getRepositoryToken(Like), useValue: repository },
        { provide: GetUserByIdService, useValue: getUserByIdServiceMock },
        { provide: GetPetByIdService, useValue: getPetByIdServiceMock },
      ],
    }).compile();

    service = module.get<LikePetService>(LikePetService);
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
    let existingPet: Pet;

    beforeEach(() => {
      existingUser = mockUserEntity(UserRole.USER, Intention.ADOPT);
      jest
        .spyOn(getUserByIdServiceMock, 'execute')
        .mockResolvedValue(existingUser);

      existingPet = mockPetEntity();
      existingPet.user = mockUserEntity(
        UserRole.USER,
        Intention.DONATE_AND_ADOPT,
      );
      jest
        .spyOn(getPetByIdServiceMock, 'execute')
        .mockResolvedValue(existingPet);

      jest
        .spyOn(repository, 'save')
        .mockImplementationOnce(async (entity: Like) => entity);
    });

    it('should register a like to a Pet from another User', async () => {
      const petId = faker.datatype.uuid();
      const userId = faker.datatype.uuid();
      const like = await service.execute(userId, petId);
      expect(like).toBeDefined();
      expect(like.user).toBe(existingUser);
      expect(like.pet).toBe(existingPet);

      expect(getUserByIdServiceMock.execute).toBeCalledWith(userId);
      expect(getPetByIdServiceMock.execute).toBeCalledWith(petId);
    });

    it('should throw NotFoundException is User is not found', async () => {
      const petId = faker.datatype.uuid();
      const userId = faker.datatype.uuid();

      jest.spyOn(getUserByIdServiceMock, 'execute').mockResolvedValueOnce(null);

      await expect(service.execute(userId, petId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException is Pet is not found', async () => {
      const petId = faker.datatype.uuid();
      const userId = faker.datatype.uuid();

      jest.spyOn(getPetByIdServiceMock, 'execute').mockResolvedValueOnce(null);

      await expect(service.execute(userId, petId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnprocessableEntityException if intention of the user is only to Donate', async () => {
      const petId = faker.datatype.uuid();
      const userId = faker.datatype.uuid();

      existingUser.profile.intention = Intention.DONATE;
      jest
        .spyOn(getUserByIdServiceMock, 'execute')
        .mockResolvedValueOnce(existingUser);

      await expect(service.execute(userId, petId)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw UnprocessableEntityException if Pet owner is the same user who sending likes', async () => {
      const petId = faker.datatype.uuid();
      const userId = faker.datatype.uuid();

      existingPet.user = existingUser;
      jest
        .spyOn(getPetByIdServiceMock, 'execute')
        .mockResolvedValueOnce(existingPet);

      await expect(service.execute(userId, petId)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });
});
