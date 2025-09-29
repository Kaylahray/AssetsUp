import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenerateReportDto } from '../dto/generate-report.dto';

// --- ASSUMPTION ---
// We assume this Asset entity exists in your project.
// It would be imported from its actual location.
class Asset {
  id: string;
  name: string;
  category: string;
  department: string;
  purchaseDate: Date;
  value: number;
}
// --- END OF ASSUMPTION ---

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  /**
   * Fetches asset data based on filter criteria.
   * @param filters DTO containing date range, category, etc.
   */
  async getAssetReportData(filters: GenerateReportDto): Promise<Asset[]> {
    const query = this.assetRepository.createQueryBuilder('asset');

    if (filters.category) {
      query.andWhere('asset.category = :category', { category: filters.category });
    }
    
    if (filters.department) {
      query.andWhere('asset.department = :department', { department: filters.department });
    }

    if (filters.startDate) {
      query.andWhere('asset.purchaseDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('asset.purchaseDate <= :endDate', { endDate: filters.endDate });
    }

    return query.getMany();
  }
}