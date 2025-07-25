import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './permission.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Role {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @ApiProperty({ type: () => [Permission] })
  @ManyToMany(() => Permission, (perm) => perm.roles, { cascade: true })
  @JoinTable()
  permissions: Permission[];
}