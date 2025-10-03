import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Role } from '../../auth/roles.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.Employee })
  role: Role;

  // Department relation temporarily commented out due to import error
  // @ManyToOne(() => Department, { nullable: true })
  // department?: Department;
  @Column({ nullable: true })
  companyId?: number;
  @Column({ nullable: true })
  branchId?: number;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations to company, department, branch (to be defined)
  // @ManyToOne(() => Company, company => company.users)
  // company: Company;
  // @ManyToOne(() => Department, department => department.users)
  // department: Department;
  // @ManyToOne(() => Branch, branch => branch.users)
  // branch: Branch;
}