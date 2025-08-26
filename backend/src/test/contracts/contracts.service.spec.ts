import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from '../../src/contracts/contracts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Contract } from '../../src/contracts/contract.entity';
import { Repository } from 'typeorm';

describe('ContractsService', () => {
  let service: ContractsService;
  let repo: Repository<Contract>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        {
          provide: getRepositoryToken(Contract),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
    repo = module.get<Repository<Contract>>(getRepositoryToken(Contract));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createContract', () => {
    it('should create a new contract', async () => {
      const dto = {
        vendorId: 'vendor-123',
        title: 'Test Lease',
        terms: '12 months lease',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        documentUrl: 'http://example.com/contract.pdf',
        status: 'Active',
      };

      jest.spyOn(repo, 'save').mockResolvedValue(dto as any);
      const result = await service.createContract(dto as any);
      expect(result).toEqual(dto);
    });
  });
});
