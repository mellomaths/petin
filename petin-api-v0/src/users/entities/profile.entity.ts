import {
  BaseEntity,
  Column,
  Entity,
  Generated,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProfileDto } from '../dto/profile.dto';
import { User } from './user.entity';

export enum UserGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  PREFER_NOT_TO_TELL = 'PREFER_NOT_TO_TELL',
}

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Generated('uuid')
  uuid: string;

  @Column()
  birthday: string;

  @Column()
  bio: string;

  @Column()
  gender: string;

  @Column()
  photo: string;

  @Column()
  intention: string;

  @OneToOne(() => User, (user) => user.profile)
  user: User;

  static fromProfileDto(dto: ProfileDto): Profile {
    const profile = new Profile();
    profile.birthday = dto.birthday;
    profile.bio = dto.bio;
    profile.gender = dto.gender;
    profile.photo = dto.photo;
    profile.intention = dto.intention;
    return profile;
  }
}
