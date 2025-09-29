import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AssetCategory } from '../../asset-categories/asset-category.entity';

@Entity('asset_subcategories')
export class AssetSubcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => AssetCategory, category => category.subcategories, { nullable: false })
  parentCategory: AssetCategory;
}
