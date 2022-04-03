import { Injectable, Logger } from '@nestjs/common';
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
    const user = await this.getUserByIdService.execute(userId);
    user.profile.bio = profileDto.bio;
    user.profile.gender = profileDto.gender;
    user.profile.photo = profileDto.photo;

    await this.profilesRepository.save(user.profile);

    return user;
  }
}
