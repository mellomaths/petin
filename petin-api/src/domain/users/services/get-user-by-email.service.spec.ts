import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetUserByEmailService } from './get-user-by-email.service';
import { Intention, User, UserRole } from '../entities/user.entity';
import { mockUserEntity } from '../../../../test/__mocks__/user.entity.mock';

describe('GetUserByEmailService', () => {
  let service: GetUserByEmailService;
  let repository: Repository<User>;

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
    } as unknown as Repository<User>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByEmailService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();

    service = module.get<GetUserByEmailService>(GetUserByEmailService);
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

    it('should find user by its email', async () => {
      const userEmail = faker.internet.email();
      const user = await service.execute(userEmail);
      expect(user).toBeDefined();

      expect(repository.findOne).toBeCalledWith({
        where: { email: userEmail },
        relations: { profile: true },
      });
    });

    it('should throw NotFoundException if there are no User with this email', async () => {
      const userEmail = faker.internet.email();

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.execute(userEmail)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
