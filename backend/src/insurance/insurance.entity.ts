import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'asset_insurance' })
export class AssetInsurance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Could be a foreign key to an assets table. We store it as UUID or number depending on your asset PK.
  @Column({ name: 'asset_id', type: 'varchar', length: 100 })
  @Index()
  assetId: string;

  @Column({ name: 'policy_number', type: 'varchar', length: 200, unique: true })
  @Index()
  policyNumber: string;

  @Column({ name: 'provider', type: 'varchar', length: 200 })
  provider: string;

  @Column({ name: 'expiry_date', type: 'timestamptz' })
  expiryDate: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
