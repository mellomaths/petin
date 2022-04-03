import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PasswordService } from './password.service';
import { GetUserByEmailService } from './services/get-user-by-email.service';
import { RegisterUserService } from './services/register-user.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { GetUserByIdService } from './services/get-user-by-id.service';
import { UpdateProfileService } from './services/update-profile.service';
import { Profile } from './entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User])],
  providers: [
    PasswordService,
    UsersService,
    RegisterUserService,
    GetUserByEmailService,
    GetUserByIdService,
    UpdateProfileService,
  ],
  exports: [
    PasswordService,
    UsersService,
    RegisterUserService,
    GetUserByEmailService,
    GetUserByIdService,
    UpdateProfileService,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
