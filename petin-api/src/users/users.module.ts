import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PasswordService } from './password.service';
import { GetUserByEmailService } from './services/get-user-by-email.service';
import { RegisterUserService } from './services/register-user.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { GetUserByIdService } from './services/get-user-by-id.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    PasswordService,
    UsersService,
    RegisterUserService,
    GetUserByEmailService,
    GetUserByIdService,
  ],
  exports: [
    PasswordService,
    UsersService,
    RegisterUserService,
    GetUserByEmailService,
    GetUserByIdService,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
