import { User } from 'src/users/entities/user.entity';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RegisterPetDto } from '../dto/register-pet.dto';
import { Like } from './like.entity';

export enum AgeType {
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export enum Species {
  DOG = 'DOG',
  CAT = 'CAT',
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
  description: string;

  @Column()
  photo: string;

  @Column()
  age: number;

  @Column()
  ageType: string;

  @Column()
  species: string;

  @ManyToOne(() => User, (user) => user.pets)
  @JoinColumn()
  user: User;

  @OneToMany(() => Like, (like) => like.pet)
  likes: Like[];

  @Column()
  createdAt: string;

  @BeforeInsert()
  setsCreationDate() {
    this.createdAt = new Date().toISOString();
  }

  static fromRegisterPetDto(dto: RegisterPetDto): Pet {
    const pet = new Pet();
    pet.name = dto.name;
    pet.description = dto.description;
    pet.photo = dto.photo;
    pet.age = dto.age;
    pet.ageType = dto.ageType;
    pet.species = dto.species;
    return pet;
  }
}
