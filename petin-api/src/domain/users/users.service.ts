import { Injectable, Logger } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserDto } from './dto/user.dto';
import { GetUserByEmailService } from './services/get-user-by-email.service';
import { RegisterUserService } from './services/register-user.service';
import { GetUserByIdService } from './services/get-user-by-id.service';
import { ProfileDto } from './dto/profile.dto';
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

  async registerUser(userDto: RegisterUserDto): Promise<UserDto> {
    const user = await this.registerUserService.execute(userDto);
    return UserDto.fromUserEntity(user);
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
  ): Promise<UserDto> {
    const user = await this.updateProfileService.execute(userId, profileDto);
    return UserDto.fromUserEntity(user);
  }
}
