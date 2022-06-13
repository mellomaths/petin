import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponseDto } from '../infrastructure/api/api-response.dto';
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
  async registerUser(@Body() user: RegisterUserDto) {
    return await this.usersService.registerUser(user);
  }

  @Get('account')
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
  @UseGuards(JwtAuthGuard)
  async getUser(@Request() request) {
    return await this.usersService.getUserById(request.user.id);
  }

  @Put('account/profile')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile updated',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    type: ApiResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() request, @Body() profile: ProfileDto) {
    return await this.usersService.updateProfile(request.user.id, profile);
  }
}
