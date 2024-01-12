import { faker } from '@faker-js/faker';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Intention, UserRole } from '../users/entities/user.entity';
import { PasswordService } from '../users/password.service';
import { mockUserDto } from '../../test/__mocks__/user.dto.mock';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  let jwtServiceMock: JwtService;
  let configServiceMock: ConfigService;
  let passwordServiceMock: PasswordService;

  beforeEach(async () => {
    jwtServiceMock = {
      sign: jest.fn(),
    } as unknown as JwtService;
    configServiceMock = {
      get: jest.fn(),
    } as unknown as ConfigService;
    passwordServiceMock = {
      checkLoginAttempt: jest.fn(),
    } as unknown as PasswordService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: PasswordService, useValue: passwordServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate user by checking login attempt', async () => {
      const email = faker.internet.email();
      const attempt = faker.internet.password();

      const existingUser = mockUserDto(UserRole.USER, Intention.ADOPT);
      jest
        .spyOn(passwordServiceMock, 'checkLoginAttempt')
        .mockResolvedValue(existingUser);

      await service.validateUser(email, attempt);

      expect(passwordServiceMock.checkLoginAttempt).toBeCalled();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const userDto = mockUserDto(UserRole.USER, Intention.ADOPT);

      jest.spyOn(jwtServiceMock, 'sign').mockReturnValueOnce('token');
      jest.spyOn(configServiceMock, 'get').mockReturnValueOnce('3600');

      const login = await service.login(userDto);

      expect(login).toBeDefined();
      expect(login.sub).toEqual(userDto.id);
      expect(login.token).toEqual('token');
      expect(login.expiresIn).toEqual(3600);

      expect(jwtServiceMock.sign).toBeCalledWith({
        sub: userDto.id,
        id: userDto.id,
        email: userDto.email,
        role: userDto.role,
      });
      expect(configServiceMock.get).toBeCalledWith('jwt.expirationTime');
    });
  });
});
