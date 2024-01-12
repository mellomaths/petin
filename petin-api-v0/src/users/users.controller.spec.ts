import { Test, TestingModule } from '@nestjs/testing';
import { mockUserDto } from '../../test/__mocks__/user.dto.mock';
import { mockRequest } from '../../test/__mocks__/request.mock';
import { Intention, UserRole } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersServiceMock: UsersService;

  beforeEach(async () => {
    usersServiceMock = {
      registerUser: jest.fn(),
      getUserByEmail: jest.fn(),
      getUserById: jest.fn(),
      updateProfile: jest.fn(),
    } as unknown as UsersService;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should get user', async () => {
      const request = mockRequest();
      const userDto = mockUserDto(UserRole.USER, Intention.ADOPT);

      jest.spyOn(usersServiceMock, 'getUserById').mockResolvedValue(userDto);

      const user = await controller.getUser(request);

      expect(user).toBeDefined();
    });
  });

  describe('updateProfile', () => {
    it('should update profile', async () => {
      const request = mockRequest();
      const userDto = mockUserDto(UserRole.USER, Intention.ADOPT);

      jest.spyOn(usersServiceMock, 'updateProfile').mockResolvedValue({
        success: true,
        messages: ['Profile updated'],
        id: userDto.id,
      });

      const response = await controller.updateProfile(request, userDto.profile);

      expect(response).toBeDefined();
    });
  });
});
