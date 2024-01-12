import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class GetUserByIdService {
  private readonly logger = new Logger(GetUserByIdService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async execute(id: string): Promise<User> {
    this.logger.log(`Getting User by its ID. (id=${id}).`);

    const user = await this.usersRepository.findOne({
      where: { uuid: id },
      relations: { profile: true },
    });

    if (!user) {
      this.logger.error(`User was not found`);
      throw new NotFoundException({
        success: false,
        messages: [`User was not found`],
      });
    }

    return user;
  }
}
