import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DepreciationMethod {
  STRAIGHT_LINE = 'straight_line',
  // Future methods can be added here
  // DECLINING_BALANCE = 'declining_balance',
  // UNITS_OF_PRODUCTION = 'units_of_production',
}

@Entity('asset_depreciations')
export class AssetDepreciation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  assetName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  purchasePrice: number;

  @Column({ type: 'date' })
  purchaseDate: Date;

  @Column({ type: 'int' })
  usefulLifeYears: number;

  @Column({
    type: 'enum',
    enum: DepreciationMethod,
    default: DepreciationMethod.STRAIGHT_LINE,
  })
  depreciationMethod: DepreciationMethod;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salvageValue: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Calculate current depreciated value using straight-line method
   * Formula: Current Value = Purchase Price - ((Purchase Price - Salvage Value) * (Years Elapsed / Useful Life))
   */
  getCurrentDepreciatedValue(): number {
    const currentDate = new Date();
    const purchaseDate = new Date(this.purchaseDate);
    const yearsElapsed = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    const salvage = this.salvageValue || 0;
    const depreciableAmount = Number(this.purchasePrice) - salvage;
    const annualDepreciation = depreciableAmount / this.usefulLifeYears;
    const totalDepreciation = Math.min(annualDepreciation * yearsElapsed, depreciableAmount);
    
    const currentValue = Number(this.purchasePrice) - totalDepreciation;
    
    // Ensure the value doesn't go below salvage value
    return Math.max(currentValue, salvage);
  }

  /**
   * Calculate annual depreciation amount
   */
  getAnnualDepreciation(): number {
    const salvage = this.salvageValue || 0;
    const depreciableAmount = Number(this.purchasePrice) - salvage;
    return depreciableAmount / this.usefulLifeYears;
  }

  /**
   * Calculate total depreciation to date
   */
  getTotalDepreciationToDate(): number {
    const currentDate = new Date();
    const purchaseDate = new Date(this.purchaseDate);
    const yearsElapsed = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    const salvage = this.salvageValue || 0;
    const depreciableAmount = Number(this.purchasePrice) - salvage;
    const annualDepreciation = depreciableAmount / this.usefulLifeYears;
    
    return Math.min(annualDepreciation * yearsElapsed, depreciableAmount);
  }

  /**
   * Calculate remaining years of useful life
   */
  getRemainingUsefulLife(): number {
    const currentDate = new Date();
    const purchaseDate = new Date(this.purchaseDate);
    const yearsElapsed = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    return Math.max(0, this.usefulLifeYears - yearsElapsed);
  }

  /**
   * Check if asset is fully depreciated
   */
  isFullyDepreciated(): boolean {
    const currentValue = this.getCurrentDepreciatedValue();
    const salvage = this.salvageValue || 0;
    return currentValue <= salvage;
  }
}
