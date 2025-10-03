import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Department } from '../../departments/department.entity';
import { Asset } from '../../assets/entities/assest.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'int' })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @OneToMany(() => Department, (department) => department.branch)
  departments: Department[];

  @OneToMany(() => Asset, (asset) => asset.assignedBranch)
  assets: Asset[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}