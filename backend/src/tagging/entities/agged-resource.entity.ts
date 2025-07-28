import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tag } from './tag.entity';

@Entity('tagged_resources')
@Index(['resourceId', 'resourceType'])
@Index(['tagId', 'resourceId', 'resourceType'], { unique: true })
export class TaggedResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tagId: string;

  @Column({ type: 'uuid' })
  resourceId: string;

  @Column({ length: 100 })
  resourceType: string;

  @CreateDateColumn()
  taggedAt: Date;

  @ManyToOne(() => Tag, tag => tag.taggedResources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tagId' })
  tag: Tag;
}
