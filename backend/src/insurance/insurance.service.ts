import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AssetInsurance } from './asset-insurance.entity';
import { CreateAssetInsuranceDto } from './dto/create-asset-insurance.dto';
import { UpdateAssetInsuranceDto } from './dto/update-asset-insurance.dto';
import { NotificationService } from './notification.service';

@Injectable()
export class AssetInsuranceService {
  private readonly logger = new Logger(AssetInsuranceService.name);

  constructor(
    @InjectRepository(AssetInsurance)
    private readonly repo: Repository<AssetInsurance>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateAssetInsuranceDto): Promise<AssetInsurance> {
    const entity = this.repo.create({
      assetId: dto.assetId,
      policyNumber: dto.policyNumber,
      provider: dto.provider,
      expiryDate: new Date(dto.expiryDate),
      notes: dto.notes ?? null,
    });
    return this.repo.save(entity);
  }

  async findOne(id: string): Promise<AssetInsurance> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`AssetInsurance ${id} not found`);
    return found;
  }

  async findAll(query: { assetId?: string; provider?: string; skip?: number; take?: number }) {
    const qb = this.repo.createQueryBuilder('ai');

    if (query.assetId) qb.andWhere('ai.assetId = :assetId', { assetId: query.assetId });
    if (query.provider) qb.andWhere('ai.provider ILIKE :provider', { provider: `%${query.provider}%` });

    if (typeof query.skip === 'number') qb.skip(query.skip);
    if (typeof query.take === 'number') qb.take(query.take);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async update(id: string, dto: UpdateAssetInsuranceDto): Promise<AssetInsurance> {
    const entity = await this.findOne(id);

    if (dto.assetId) entity.assetId = dto.assetId;
    if (dto.policyNumber) entity.policyNumber = dto.policyNumber;
    if (dto.provider) entity.provider = dto.provider;
    if (dto.expiryDate) entity.expiryDate = new Date(dto.expiryDate);
    if (dto.notes !== undefined) entity.notes = dto.notes;

    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const res = await this.repo.delete({ id });
    if (res.affected === 0) throw new NotFoundException(`AssetInsurance ${id} not found`);
  }

  /**
   * Return policies that will expire within the next `days` (inclusive)
   */
  async findExpiringWithin(days: number) {
    const now = new Date();
    const until = new Date(now);
    until.setUTCDate(until.getUTCDate() + days);

    return this.repo.find({
      where: {
        expiryDate: MoreThanOrEqual(now) as any, // ensure expiry >= now
      },
    }).then(list => list.filter(item => item.expiryDate <= until));
  }

  /**
   * Run the expiry check and send notifications via NotificationService
   */
  async runExpiryNotifications(daysBeforeExpiry = 30) {
    this.logger.log(`Checking policies expiring within ${daysBeforeExpiry} day(s)...`);
    const now = new Date();
    const until = new Date(now);
    until.setUTCDate(until.getUTCDate() + daysBeforeExpiry);

    const toNotify = await this.repo.createQueryBuilder('ai')
      .where('ai.expiry_date BETWEEN :now AND :until', { now: now.toISOString(), until: until.toISOString() })
      .getMany();

    this.logger.log(`Found ${toNotify.length} policy(ies) to notify`);
    for (const policy of toNotify) {
      try {
        await this.notificationService.notifyExpiry(policy, daysBeforeExpiry);
      } catch (err) {
        this.logger.error(`Failed to send notification for policy ${policy.id}: ${err?.message ?? err}`);
      }
    }
  }
}
