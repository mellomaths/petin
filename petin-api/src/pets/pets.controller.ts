import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponseDto } from '../infrastructure/api/api-response.dto';
import { IdParam } from '../utils/dto/id.param';
import { PetDto } from './dto/pet.dto';
import { RegisterPetDto } from './dto/register-pet.dto';
import { PetsService } from './pets.service';

@Controller('pets')
export class PetsController {
  private readonly logger = new Logger(PetsController.name);

  constructor(private readonly petsService: PetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pet successfully added',
    type: ApiResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  async addPet(@Request() request, @Body() pet: RegisterPetDto) {
    return await this.petsService.registerPet(request.user.id, pet);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pets successfully listed',
    type: PetDto,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  async listPets(@Request() request) {
    return await this.petsService.listPets(request.user.id);
  }

  @Post(':id/likes')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pet successfully added',
    type: ApiResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  async likePet(@Request() request, @Param() params: IdParam) {
    return await this.petsService.likePet(request.user.id, params.id);
  }
}
