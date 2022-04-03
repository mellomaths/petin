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

export enum Gender {
  MALE,
  FEMALE,
  PREFER_NOT_TO_TELL,
}

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  photo: string;

  @OneToOne(() => User, (user) => user.profile)
  user: User;

  static fromProfileDto(dto: ProfileDto): Profile {
    const profile = new Profile();
    profile.bio = dto.bio;
    profile.gender = dto.gender;
    profile.photo = dto.photo;
    return profile;
  }
}
