import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { TaggedResource } from './tagged-resource.entity';

@Entity('tags')
@Index(['name', 'createdBy'], { unique: true })
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 7, default: '#3B82F6' }) // Default blue color
  colorHex: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TaggedResource, taggedResource => taggedResource.tag, { cascade: true })
  taggedResources: TaggedResource[];
}