import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  Generated,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pet } from './pet.entity';
import { PhotoDto } from '../dto/photo.dto';

@Entity()
export class Photo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Generated('uuid')
  uuid: string;

  @ManyToOne(() => Pet, (pet) => pet.photos)
  pet: Pet;

  @Column()
  url: string;

  @Column()
  createdAt: string;

  @BeforeInsert()
  setsCreationDate() {
    this.createdAt = new Date().toISOString();
  }

  static fromPhotoDto(dto: PhotoDto): Photo {
    const photo = new Photo();
    photo.url = dto.url;
    return photo;
  }
}
