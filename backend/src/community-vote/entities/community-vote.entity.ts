import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'community_votes' })
export class CommunityVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string; // e.g., "New Feature Idea: Multiplayer Mode"

  @Column({ type: 'text' })
  description: string; // Detailed description of the idea/theme

  @Column({ default: 0 })
  votes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
