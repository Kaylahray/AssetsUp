import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  mimeType: string;
}
