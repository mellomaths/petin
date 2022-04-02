import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class GetUserByEmailService {
  private readonly logger = new Logger(GetUserByEmailService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async execute(email: string): Promise<User> {
    this.logger.log(`Getting User by its email`);

    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      this.logger.log(`User was not found`);
      throw new NotFoundException({
        success: false,
        messages: [`User was not found`],
      });
    }

    return user;
  }
}
