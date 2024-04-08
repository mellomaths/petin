import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PetsService } from './pets.service';
import { PetDto } from './dto/pet.dto';
import { RegisterPetDto } from './dto/register-pet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRequest } from '../auth/dto/user-request.dto';

@Controller('pets')
@ApiTags('pets')
export class PetsController {
  private readonly logger = new Logger(PetsController.name);

  constructor(private readonly petsService: PetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully created',
    type: PetDto,
  })
  @UseGuards(JwtAuthGuard)
  async registerPet(
    @Request() request: UserRequest,
    @Body() pet: RegisterPetDto,
  ) {
    return await this.petsService.registerPet(request.user.id, pet);
  }
}
