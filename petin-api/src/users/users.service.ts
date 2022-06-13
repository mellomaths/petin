import { Injectable, Logger } from '@nestjs/common';
import { ApiResponseDto } from '../infrastructure/api/api-response.dto';
import { ProfileDto } from './dto/profile.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserDto } from './dto/user.dto';
import { GetUserByEmailService } from './services/get-user-by-email.service';
import { GetUserByIdService } from './services/get-user-by-id.service';
import { RegisterUserService } from './services/register-user.service';
import { UpdateProfileService } from './services/update-profile.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly registerUserService: RegisterUserService,
    private readonly getUserByEmailService: GetUserByEmailService,
    private readonly getUserByIdService: GetUserByIdService,
    private readonly updateProfileService: UpdateProfileService,
  ) {}

  async registerUser(userDto: RegisterUserDto): Promise<ApiResponseDto> {
    const user = await this.registerUserService.execute(userDto);
    return {
      success: true,
      messages: [`User account successfully created.`],
      id: user.uuid,
    };
  }

  async getUserByEmail(email: string): Promise<UserDto> {
    const user = await this.getUserByEmailService.execute(email);
    return UserDto.fromUserEntity(user);
  }

  async getUserById(id: string): Promise<UserDto> {
    const user = await this.getUserByIdService.execute(id);
    return UserDto.fromUserEntity(user);
  }

  async updateProfile(
    userId: string,
    profileDto: ProfileDto,
  ): Promise<ApiResponseDto> {
    const user = await this.updateProfileService.execute(userId, profileDto);
    return {
      success: true,
      messages: ['User account successfully updated.'],
      id: user.uuid,
    };
  }
}
