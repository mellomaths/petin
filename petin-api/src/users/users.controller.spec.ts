import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersServiceMock: UsersService;

  beforeEach(async () => {
    usersServiceMock = {
      registerUserService: jest.fn(),
      getUserByEmailService: jest.fn(),
      getUserByIdService: jest.fn(),
      updateProfileService: jest.fn(),
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
});
