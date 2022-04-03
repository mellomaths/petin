import {
  BaseEntity,
  Column,
  Entity,
  Generated,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RegisterUserDto } from '../dto/register-user.dto';
import { Profile } from './profile.entity';

export enum UserRole {
  USER = 'USER',
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Generated('uuid')
  uuid: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  role: string;

  @Column()
  birthday: string;

  @Column({ unique: true })
  cpf: string;

  @OneToOne(() => Profile, { cascade: true })
  @JoinColumn()
  profile: Profile;

  @Column()
  password: string;

  @Column()
  createdAt: string;

  static fromRegisterUserDto(dto: RegisterUserDto): User {
    const user = new User();
    user.name = dto.name;
    user.email = dto.email;
    user.role = dto.role;
    user.birthday = dto.birthday;
    user.cpf = dto.cpf;
    user.profile = new Profile();
    user.profile.bio = null;
    user.profile.gender = null;
    user.profile.photo = null;
    user.password = dto.password;
    user.createdAt = new Date().toISOString();
    return user;
  }
}
