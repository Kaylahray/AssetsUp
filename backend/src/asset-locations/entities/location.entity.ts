import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'asset_locations' })
@Index(['assetId'], { unique: true })
export class AssetLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Reference to the asset (assumes assets are tracked elsewhere)
  @Column({ type: 'uuid' })
  assetId: string;

  // Reference to a branch or warehouse (optional)
  @Column({ type: 'uuid', nullable: true })
  branchId?: string | null;

  // GPS coordinates stored as separate columns for portability
  @Column({ type: 'double precision', nullable: true })
  latitude?: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude?: number | null;

  // Optionally store freeform location note
  @Column({ type: 'text', nullable: true })
  locationNote?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
