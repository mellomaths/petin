import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Intention, User, UserRole } from '../entities/user.entity';
import { mockUserEntity } from '../../../../test/__mocks__/user.entity.mock';
import { GetUserByIdService } from './get-user-by-id.service';

describe('GetUserByIdService', () => {
  let service: GetUserByIdService;
  let repository: Repository<User>;

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
    } as unknown as Repository<User>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();

    service = module.get<GetUserByIdService>(GetUserByIdService);
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
      existingUser = mockUserEntity(UserRole.USER, Intention.ADOPT);
      jest.spyOn(repository, 'findOne').mockResolvedValue(existingUser);
    });

    it('should find user by its id', async () => {
      const userId = faker.datatype.uuid();
      const user = await service.execute(userId);
      expect(user).toBeDefined();

      expect(repository.findOne).toBeCalledWith({
        where: { uuid: userId },
        relations: { profile: true },
      });
    });

    it('should throw NotFoundException if there are no User with this id', async () => {
      const userId = faker.datatype.uuid();

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.execute(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
