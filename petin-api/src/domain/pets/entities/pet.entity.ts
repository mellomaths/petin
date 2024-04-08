import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  Generated,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Photo } from './photo.entity';
import { Profile } from 'src/domain/users/entities/profile.entity';
import { User } from 'src/domain/users/entities/user.entity';
import { PetDto } from '../dto/pet.dto';
import { RegisterPetDto } from '../dto/register-pet.dto';

export enum PetType {
  DOG = 'DOG',
  CAT = 'CAT',
  OTHER = 'OTHER',
}

export enum PetSex {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

@Entity()
export class Pet extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Generated('uuid')
  uuid: string;

  @Column()
  name: string;

  @Column()
  birthday: string;

  @Column()
  type: string;

  @Column()
  bio: string;

  @Column()
  sex: string;

  @OneToMany(() => Photo, (photo) => photo.pet)
  photos: Photo[];

  @ManyToOne(() => User, (user) => user.pets)
  owner: User;

  @Column()
  createdAt: string;

  @BeforeInsert()
  setsCreationDate() {
    this.createdAt = new Date().toISOString();
  }

  static fromRegisterPetDto(dto: RegisterPetDto): Pet {
    const pet = new Pet();
    pet.name = dto.name;
    pet.birthday = dto.birthday;
    pet.type = dto.type;
    pet.bio = dto.bio;
    pet.sex = dto.sex;
    return pet;
  }
}
