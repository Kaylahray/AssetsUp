import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetTransfersService } from './asset-transfers.service';
import { AssetTransfer } from './entities/asset-transfer.entity';
import { InventoryItem } from '../../inventory-items/entities/inventory-item.entity';
import { InitiateTransferDto } from './dto/initiate-transfer.dto';

describe('AssetTransfersService', () => {
  let service: AssetTransfersService;
  let transferRepo: Repository<AssetTransfer>;
  let inventoryRepo: Repository<InventoryItem>;

  const mockTransferRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockInventoryRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetTransfersService,
        { provide: getRepositoryToken(AssetTransfer), useValue: mockTransferRepo },
        { provide: getRepositoryToken(InventoryItem), useValue: mockInventoryRepo },
      ],
    }).compile();

    service = module.get<AssetTransfersService>(AssetTransfersService);
    transferRepo = module.get<Repository<AssetTransfer>>(getRepositoryToken(AssetTransfer));
    inventoryRepo = module.get<Repository<InventoryItem>>(getRepositoryToken(InventoryItem));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(transferRepo).toBeDefined();
    expect(inventoryRepo).toBeDefined();
  });

  it('updates asset currentDepartmentId and logs transfer with previous fromDepartmentId', async () => {
    const assetId = 'a-uuid';
    const dto: InitiateTransferDto = {
      assetId,
      toDepartmentId: 20,
      initiatedBy: 'john.doe',
      reason: 'Relocation',
    } as InitiateTransferDto;

    const asset: Partial<InventoryItem> = {
      id: assetId,
      currentDepartmentId: 10,
    };

    const createdTransfer: Partial<AssetTransfer> = {
      id: 1,
      assetId,
      fromDepartmentId: 10,
      toDepartmentId: 20,
      transferDate: new Date(),
      initiatedBy: dto.initiatedBy,
      reason: dto.reason,
    };

    mockInventoryRepo.findOne.mockResolvedValue(asset);
    mockTransferRepo.create.mockImplementation((data) => ({ id: 1, ...data }));
    mockTransferRepo.save.mockImplementation((data) => data);
    mockInventoryRepo.save.mockImplementation((data) => data);

    const result = await service.initiateTransfer(dto);

    expect(mockInventoryRepo.findOne).toHaveBeenCalledWith({ where: { id: assetId } });
    expect(mockInventoryRepo.save).toHaveBeenCalledWith({ ...asset, currentDepartmentId: 20 });
    expect(mockTransferRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        assetId,
        fromDepartmentId: 10,
        toDepartmentId: 20,
        initiatedBy: 'john.doe',
        reason: 'Relocation',
      }),
    );
    expect(result).toEqual(expect.objectContaining({ id: 1, assetId }));
  });

  it('prefers provided fromDepartmentId when passed in dto', async () => {
    const assetId = 'a-uuid';
    const dto: InitiateTransferDto = {
      assetId,
      fromDepartmentId: 5,
      toDepartmentId: 7,
      initiatedBy: 'ops',
    } as InitiateTransferDto;

    mockInventoryRepo.findOne.mockResolvedValue({ id: assetId, currentDepartmentId: 10 });
    mockTransferRepo.create.mockImplementation((data) => ({ id: 2, ...data }));
    mockTransferRepo.save.mockImplementation((data) => data);
    mockInventoryRepo.save.mockImplementation((data) => data);

    const result = await service.initiateTransfer(dto);

    expect(mockTransferRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ fromDepartmentId: 5, toDepartmentId: 7 }),
    );
    expect(result).toEqual(expect.objectContaining({ id: 2 }));
  });

  it('throws when asset not found', async () => {
    const dto: InitiateTransferDto = {
      assetId: 'missing',
      toDepartmentId: 1,
      initiatedBy: 'ops',
    } as InitiateTransferDto;
    mockInventoryRepo.findOne.mockResolvedValue(undefined);
    await expect(service.initiateTransfer(dto)).rejects.toThrow('Asset missing not found');
  });
});


