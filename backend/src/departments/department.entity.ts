import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships (commented out until related entities are created)
  // @ManyToOne(() => Company, company => company.departments)
  // company: Company;

  // @OneToMany(() => User, user => user.department)
  // users: User[];

  // @OneToMany(() => Asset, asset => asset.department)
  // assets: Asset[];
}
