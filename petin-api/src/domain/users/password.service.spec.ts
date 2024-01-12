import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import { GetUserByEmailService } from './services/get-user-by-email.service';

describe('PasswordService', () => {
  let service: PasswordService;
  let getUserByEmailServiceMock: GetUserByEmailService;

  beforeEach(async () => {
    getUserByEmailServiceMock = {
      execute: jest.fn(),
    } as unknown as GetUserByEmailService;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        { provide: GetUserByEmailService, useValue: getUserByEmailServiceMock },
      ],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
