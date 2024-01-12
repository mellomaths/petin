import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  let healthServiceMock: HealthCheckService;
  let typeOrmHealthIndicatorMock: TypeOrmHealthIndicator;

  beforeEach(async () => {
    healthServiceMock = {
      check: jest.fn(),
    } as unknown as HealthCheckService;
    typeOrmHealthIndicatorMock = {
      pingCheck: jest.fn(),
    } as unknown as TypeOrmHealthIndicator;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: healthServiceMock },
        {
          provide: TypeOrmHealthIndicator,
          useValue: typeOrmHealthIndicatorMock,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
