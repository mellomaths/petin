import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { mockUserEntity } from '../../test/__mocks__/user.entity.mock';
import { mockProfileDto } from '../../test/__mocks__/profile.dto.mock';
import { mockRegisterUserDto } from '../../test/__mocks__/register-user.dto.mock';
import { Intention, User, UserRole } from './entities/user.entity';
import { GetUserByEmailService } from './services/get-user-by-email.service';
import { GetUserByIdService } from './services/get-user-by-id.service';
import { RegisterUserService } from './services/register-user.service';
import { UpdateProfileService } from './services/update-profile.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  let registerUserServiceMock: RegisterUserService;
  let getUserByEmailServiceMock: GetUserByEmailService;
  let getUserByIdServiceMock: GetUserByIdService;
  let updateProfileServiceMock: UpdateProfileService;

  beforeEach(async () => {
    registerUserServiceMock = {
      execute: jest.fn(),
    } as unknown as RegisterUserService;
    getUserByEmailServiceMock = {
      execute: jest.fn(),
    } as unknown as GetUserByEmailService;
    getUserByIdServiceMock = {
      execute: jest.fn(),
    } as unknown as GetUserByIdService;
    updateProfileServiceMock = {
      execute: jest.fn(),
    } as unknown as UpdateProfileService;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: RegisterUserService, useValue: registerUserServiceMock },
        { provide: GetUserByEmailService, useValue: getUserByEmailServiceMock },
        { provide: GetUserByIdService, useValue: getUserByIdServiceMock },
        { provide: UpdateProfileService, useValue: updateProfileServiceMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register new user', async () => {
      const registerUserDto = mockRegisterUserDto(
        UserRole.USER,
        Intention.ADOPT,
      );

      const userMocked = User.fromRegisterUserDto(registerUserDto);
      jest
        .spyOn(registerUserServiceMock, 'execute')
        .mockResolvedValue(userMocked);

      const response = await service.registerUser(registerUserDto);

      expect(response).toBeTruthy();
      expect(response.success).toBe(true);
      expect(response.messages[0]).toBe('User account successfully created.');
      expect(response.id).toBe(userMocked.uuid);
    });
  });

  describe('getUserByEmail', () => {
    it('should get user by its email', async () => {
      const registerUserDto = mockRegisterUserDto(
        UserRole.USER,
        Intention.ADOPT,
      );

      const userMocked = User.fromRegisterUserDto(registerUserDto);
      jest
        .spyOn(getUserByEmailServiceMock, 'execute')
        .mockResolvedValue(userMocked);

      const email = faker.internet.email();
      const user = await service.getUserByEmail(email);

      expect(user).toBeTruthy();
      expect(user.id).toBe(userMocked.uuid);
    });
  });

  describe('getUserById', () => {
    it('should get user by its id', async () => {
      const registerUserDto = mockRegisterUserDto(
        UserRole.USER,
        Intention.ADOPT,
      );

      const userMocked = User.fromRegisterUserDto(registerUserDto);
      jest
        .spyOn(getUserByIdServiceMock, 'execute')
        .mockResolvedValue(userMocked);

      const email = faker.internet.email();
      const user = await service.getUserById(email);

      expect(user).toBeTruthy();
      expect(user.id).toBe(userMocked.uuid);
    });
  });

  describe('updateProfile', () => {
    it('should update users profile', async () => {
      const profileDto = mockProfileDto(Intention.ADOPT);
      const userMocked = mockUserEntity(UserRole.USER, Intention.ADOPT);
      jest
        .spyOn(updateProfileServiceMock, 'execute')
        .mockResolvedValue(userMocked);

      const userId = faker.datatype.uuid();
      const response = await service.updateProfile(userId, profileDto);

      expect(response).toBeTruthy();
      expect(response.success).toBe(true);
      expect(response.messages[0]).toBe('User account successfully updated.');
      expect(response.id).toBe(userMocked.uuid);
    });
  });
});
