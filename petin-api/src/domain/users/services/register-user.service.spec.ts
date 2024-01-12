import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Intention, User, UserRole } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { RegisterUserService } from './register-user.service';
import { PasswordService } from '../password.service';
import { mockUserEntity } from '../../../../test/__mocks__/user.entity.mock';
import { mockRegisterUserDto } from '../../../../test/__mocks__/register-user.dto.mock';

describe('RegisterUserService', () => {
  let service: RegisterUserService;
  let repository: Repository<User>;
  let passwordServiceMock: PasswordService;

  beforeEach(async () => {
    passwordServiceMock = {
      hashPassword: jest.fn(),
    } as unknown as PasswordService;
    repository = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as Repository<User>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserService,
        { provide: getRepositoryToken(User), useValue: repository },
        { provide: PasswordService, useValue: passwordServiceMock },
      ],
    }).compile();

    service = module.get<RegisterUserService>(RegisterUserService);
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
        .mockImplementationOnce(async (entity: User) => entity);
      jest
        .spyOn(passwordServiceMock, 'hashPassword')
        .mockImplementationOnce(async (password: string) => password);
    });

    it('should register new User', async () => {
      const userDto = mockRegisterUserDto(UserRole.USER, Intention.ADOPT);

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      const user = await service.execute(userDto);

      expect(user).toBeTruthy();
      expect(user.name).toBe(userDto.name);
      expect(user.email).toBe(userDto.email);
    });

    it('should not allow to register user with duplicated email', async () => {
      const userDto = mockRegisterUserDto(UserRole.USER, Intention.ADOPT);
      userDto.email = existingUser.email;

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(existingUser);

      await expect(service.execute(userDto)).rejects.toThrow(ConflictException);
    });
  });
});
