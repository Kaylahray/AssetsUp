import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

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

  @Column()
  role: string;

  // Relations to company, department, branch (to be defined)
  // @ManyToOne(() => Company, company => company.users)
  // company: Company;
  // @ManyToOne(() => Department, department => department.users)
  // department: Department;
  // @ManyToOne(() => Branch, branch => branch.users)
  // branch: Branch;
}
