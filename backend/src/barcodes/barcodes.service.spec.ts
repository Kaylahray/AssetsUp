import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Barcode, BarcodeType } from './barcode.entity';
import { Repository } from 'typeorm';
import { BarcodeService } from './barcodes.service';

describe('BarcodeService', () => {
  let service: BarcodeService;
  let repo: Repository<Barcode>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BarcodeService,
        {
          provide: getRepositoryToken(Barcode),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BarcodeService>(BarcodeService);
    repo = module.get<Repository<Barcode>>(getRepositoryToken(Barcode));
  });

  it('should generate a new barcode', async () => {
    const dto = { referenceId: 'asset123', type: BarcodeType.CODE128 };
    jest.spyOn(repo, 'save').mockResolvedValue({ ...dto, id: '1', code: 'mock-code' } as any);

    const result = await service.generateBarcode(dto);
    expect(result.referenceId).toBe('asset123');
  });
});