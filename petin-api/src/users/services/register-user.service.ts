import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterUserDto } from '../dto/register-user.dto';
import { User } from '../entities/user.entity';
import { PasswordService } from '../password.service';

@Injectable()
export class RegisterUserService {
  private readonly logger = new Logger(RegisterUserService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}
  async execute(userDto: RegisterUserDto): Promise<User> {
    this.logger.log(`Registering user`);
    const { email } = userDto;
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      this.logger.debug(`User with email "${email}" already registered`);
      throw new ConflictException({
        success: false,
        messages: [`User with email = "${email}" is already registered.`],
      });
    }

    let user = User.fromRegisterUserDto(userDto);
    user.password = await this.passwordService.hashPassword(user.password);
    user = await this.usersRepository.save(user);
    this.logger.debug(
      `User successfully registered (id=${user.id}) (uuid=${user.uuid})`,
    );
    return user;
  }
}
