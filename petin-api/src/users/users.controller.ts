import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiResponseDto } from 'src/infrastructure/api/api-response.dto';
import { IdParam } from 'src/utils/dto/id.param';
import { ProfileDto } from './dto/profile.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully created',
    type: ApiResponseDto,
  })
  @UsePipes(ValidationPipe)
  async registerUser(@Body() user: RegisterUserDto) {
    return await this.usersService.registerUser(user);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User found',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    type: ApiResponseDto,
  })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  async getUser(@Param() params: IdParam) {
    return await this.usersService.getUserById(params.id);
  }

  @Put(':id/profile')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Profile updated',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    type: ApiResponseDto,
  })
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Param() params: IdParam, @Body() profile: ProfileDto) {
    return await this.usersService.updateProfile(params.id, profile);
  }
}
