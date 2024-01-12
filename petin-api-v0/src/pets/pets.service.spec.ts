import { Test, TestingModule } from '@nestjs/testing';
import { PetsService } from './pets.service';
import { LikePetService } from './services/like-pet.service';
import { ListPetsService } from './services/list-pets.service';
import { RegisterPetService } from './services/register-pet.service';

describe('PetsService', () => {
  let service: PetsService;
  let registerPetServiceMock: RegisterPetService;
  let listPetsServiceMock: ListPetsService;
  let likePetServiceMock: LikePetService;

  beforeEach(async () => {
    registerPetServiceMock = {
      execute: jest.fn(),
    } as unknown as RegisterPetService;
    listPetsServiceMock = {
      execute: jest.fn(),
    } as unknown as ListPetsService;
    likePetServiceMock = {
      execute: jest.fn(),
    } as unknown as LikePetService;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsService,
        { provide: RegisterPetService, useValue: registerPetServiceMock },
        { provide: ListPetsService, useValue: listPetsServiceMock },
        { provide: LikePetService, useValue: likePetServiceMock },
      ],
    }).compile();

    service = module.get<PetsService>(PetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
