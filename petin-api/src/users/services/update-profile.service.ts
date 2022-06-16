import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileDto } from '../dto/profile.dto';
import { Profile } from '../entities/profile.entity';
import { User } from '../entities/user.entity';
import { GetUserByIdService } from './get-user-by-id.service';

@Injectable()
export class UpdateProfileService {
  private readonly logger = new Logger(UpdateProfileService.name);

  constructor(
    private readonly getUserByIdService: GetUserByIdService,
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
  ) {}

  async execute(userId: string, profileDto: ProfileDto): Promise<User> {
    this.logger.log(`Updating profile of an user (userId=${userId})`);
    const user = await this.getUserByIdService.execute(userId);
    if (!user) {
      this.logger.error(`User id='${userId}' was not found`);
      throw new NotFoundException({
        success: false,
        messages: [`User was not found`],
      });
    }

    user.profile.birthday = profileDto.birthday;
    user.profile.bio = profileDto.bio;
    user.profile.gender = profileDto.gender;
    user.profile.photo = profileDto.photo;
    user.profile.intention = profileDto.intention;

    await this.profilesRepository.save(user.profile);

    return user;
  }
}
