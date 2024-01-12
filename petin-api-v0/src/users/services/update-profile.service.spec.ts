import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockUserEntity } from '../../../test/__mocks__/user.entity.mock';
import { Intention, User, UserRole } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetUserByIdService } from './get-user-by-id.service';
import { mockProfileDto } from '../../../test/__mocks__/profile.dto.mock';
import { UpdateProfileService } from './update-profile.service';
import { faker } from '@faker-js/faker';
import { Profile } from '../entities/profile.entity';

describe('UpdateProfileService', () => {
  let service: UpdateProfileService;
  let repository: Repository<Profile>;
  let getUserByIdService: GetUserByIdService;

  beforeEach(async () => {
    getUserByIdService = {
      execute: jest.fn(),
    } as unknown as GetUserByIdService;
    repository = {
      save: jest.fn(),
    } as unknown as Repository<Profile>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileService,
        { provide: getRepositoryToken(Profile), useValue: repository },
        { provide: GetUserByIdService, useValue: getUserByIdService },
      ],
    }).compile();

    service = module.get<UpdateProfileService>(UpdateProfileService);
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
        .spyOn(repository, 'save')
        .mockImplementation(async (entity: Profile) => entity);
    });

    it('should update users profile', async () => {
      const profileDto = mockProfileDto(Intention.ADOPT);
      const userId = faker.datatype.uuid();

      jest
        .spyOn(getUserByIdService, 'execute')
        .mockResolvedValueOnce(existingUser);

      const user = await service.execute(userId, profileDto);

      expect(user).toBeTruthy();
      expect(user.profile.birthday).toBe(profileDto.birthday);
      expect(user.profile.bio).toBe(profileDto.bio);
      expect(user.profile.gender).toBe(profileDto.gender);
      expect(user.profile.photo).toBe(profileDto.photo);
      expect(user.profile.intention).toBe(profileDto.intention);

      expect(getUserByIdService.execute).toBeCalledWith(userId);
      expect(repository.save).toBeCalledWith(user.profile);
    });

    it('should throw NotFoundException is User is not found', async () => {
      const profileDto = mockProfileDto(Intention.ADOPT);
      const userId = faker.datatype.uuid();

      jest.spyOn(getUserByIdService, 'execute').mockResolvedValueOnce(null);

      await expect(service.execute(userId, profileDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
