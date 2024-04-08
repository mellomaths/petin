import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  Generated,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RegisterUserDto } from '../dto/register-user.dto';
import { Profile } from './profile.entity';
import { Pet } from 'src/domain/pets/entities/pet.entity';

export enum UserRole {
  USER = 'USER',
}

export enum Intention {
  ADOPT = 'ADOPT',
  DONATE = 'DONATE',
  DONATE_AND_ADOPT = 'DONATE_AND_ADOPT',
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

  @Column({ unique: true })
  cpf: string;

  @OneToOne(() => Profile, { cascade: true })
  @JoinColumn()
  profile: Profile;

  @Column()
  password: string;

  @OneToMany(() => Pet, (pet) => pet.owner)
  pets: Pet[];

  @Column()
  createdAt: string;

  @BeforeInsert()
  setsCreationDate() {
    this.createdAt = new Date().toISOString();
  }

  static fromRegisterUserDto(dto: RegisterUserDto): User {
    const user = new User();
    user.name = dto.name;
    user.email = dto.email;
    user.role = dto.role;
    user.cpf = dto.cpf;
    user.profile = Profile.fromProfileDto(dto.profile);
    user.password = dto.password;
    return user;
  }
}
