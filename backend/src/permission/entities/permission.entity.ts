import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity';

@Entity()
export class Permission {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}