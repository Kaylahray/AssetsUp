import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

export enum OrganizationUnitType {
  BRANCH = 'branch',
  DEPARTMENT = 'department',
  TEAM = 'team',
}

@Entity('organization_units')
export class OrganizationUnit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: OrganizationUnitType })
  type: OrganizationUnitType;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => OrganizationUnit, (unit) => unit.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: OrganizationUnit;

  @OneToMany(() => OrganizationUnit, (unit) => unit.parent)
  children: OrganizationUnit[];

  @Column({ nullable: true })
  head: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 