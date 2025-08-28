import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ContractStatus } from './enums/contract-status.enum';


@Entity('contracts')
export class Contract {
@PrimaryGeneratedColumn('uuid')
id: string; // internal id


@Index({ unique: true })
@Column({ type: 'varchar', length: 100 })
contractId: string; // public identifier


@Index()
@Column({ type: 'varchar', length: 100 })
vendorId: string; // generic FK to vendor


@Column({ type: 'varchar', length: 200 })
title: string;


@Column({ type: 'text' })
terms: string;


@Index()
@Column({ type: 'timestamptz' })
startDate: Date;


@Index()
@Column({ type: 'timestamptz' })
endDate: Date;


@Column({ type: 'varchar', length: 500, nullable: true })
documentUrl?: string | null; // path or external URL


@Index()
@Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.PENDING })
status: ContractStatus;


@CreateDateColumn({ type: 'timestamptz' })
createdAt: Date;


@UpdateDateColumn({ type: 'timestamptz' })
updatedAt: Date;
}