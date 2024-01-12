import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { mockRequest } from '../../../test/__mocks__/request.mock';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: AuthService;

  beforeEach(async () => {
    authServiceMock = {
      login: jest.fn(),
    } as unknown as AuthService;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should receive request to login', async () => {
      const request = mockRequest();

      jest.spyOn(authServiceMock, 'login').mockResolvedValue({
        sub: faker.datatype.uuid(),
        token: faker.datatype.hexadecimal(),
        expiresIn: faker.datatype.number(),
      });

      await controller.login(request);
      expect(authServiceMock.login).toBeCalled();
    });
  });
});
