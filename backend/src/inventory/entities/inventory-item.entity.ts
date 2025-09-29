import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ManyToOne } from 'typeorm';
import { AssetSubcategory } from '../../asset-subcategories/entities/asset-subcategory.entity';

@Entity()
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  sku: string;

  @Column({ type: 'int' })
  quantity: number;

  // --- ADD THIS NEW FIELD ---
  @Column({ type: 'int', default: 10 }) // Default threshold of 10 units
  threshold: number;

  @ManyToOne(() => AssetSubcategory, { nullable: true })
  subcategory: AssetSubcategory;
}