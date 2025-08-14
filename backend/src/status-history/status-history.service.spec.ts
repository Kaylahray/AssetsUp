import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusHistoryService } from './status-history.service';
import { StatusHistory, AssetStatus } from './entities/status-history.entity';
import { CreateStatusHistoryDto } from './dto/create-status-history.dto';


describe('StatusHistoryService', () => {
  let service: StatusHistoryService;
  let repository: jest.Mocked<Partial<Repository<StatusHistory>>>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusHistoryService,
        {
          provide: getRepositoryToken(StatusHistory),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<StatusHistoryService>(StatusHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logStatusChange', () => {
    it('creates and saves a status history record', async () => {
      const dto: CreateStatusHistoryDto = {
        assetId: 'asset-1',
        previousStatus: AssetStatus.ACTIVE,
        newStatus: AssetStatus.UNDER_MAINTENANCE,
        changedBy: 'user-1',
      };

      const created: Partial<StatusHistory> = { id: 'id-1', ...dto };
      (repository.create as jest.Mock).mockReturnValue(created);
      (repository.save as jest.Mock).mockResolvedValue(created);

      const result = await service.logStatusChange(dto);

      expect(repository.create).toHaveBeenCalledWith({
        assetId: dto.assetId,
        previousStatus: dto.previousStatus,
        newStatus: dto.newStatus,
        changedBy: dto.changedBy,
      });
      expect(repository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('getByAsset', () => {
    it('returns records ordered by changeDate desc', async () => {
      const assetId = 'asset-1';
      const records: StatusHistory[] = [
        { id: '2', assetId, previousStatus: AssetStatus.IN_TRANSFER, newStatus: AssetStatus.ACTIVE, changeDate: new Date(), changedBy: 'u2' },
        { id: '1', assetId, previousStatus: AssetStatus.ACTIVE, newStatus: AssetStatus.IN_TRANSFER, changeDate: new Date(), changedBy: 'u1' },
      ] as StatusHistory[];
      (repository.find as jest.Mock).mockResolvedValue(records);

      const res = await service.getByAsset(assetId);

      expect(repository.find).toHaveBeenCalledWith({
        where: { assetId },
        order: { changeDate: 'DESC' },
      });
      expect(res).toBe(records);
    });
  });
});
