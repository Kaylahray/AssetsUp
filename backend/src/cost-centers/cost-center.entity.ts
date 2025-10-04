import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Asset } from '../../assets/entities/asset.entity';
import { Expense } from '../../expenses/entities/expense.entity';


@Entity({ name: 'cost_centers' })
export class CostCenter {
@PrimaryGeneratedColumn('uuid')
id: string;


@Column({ type: 'varchar', length: 200, unique: true })
name: string;


@Column({ type: 'text', nullable: true })
description?: string | null;


// Optional reverse relations if you maintain assets/expenses in the same project
@OneToMany(() => Asset, (asset) => asset.costCenter, { cascade: false })
assets?: Asset[];


@OneToMany(() => Expense, (expense) => expense.costCenter, { cascade: false })
expenses?: Expense[];


@CreateDateColumn({ name: 'created_at' })
createdAt: Date;


@UpdateDateColumn({ name: 'updated_at' })
updatedAt: Date;
}