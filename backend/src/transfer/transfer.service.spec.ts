import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { beforeEach, describe, it } from 'node:test';
import { TransferService } from './transfer.service';
import { TransferRequest } from './transfer-request.entity';
import { TransferStatus } from './enums/transfer-status.enum';

describe('TransferService', () => {
  let service: TransferService;
  let repo: jest.Mocked<Repository<TransferRequest>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TransferService,
        {
          provide: getRepositoryToken(TransferRequest),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(TransferService);
    repo = module.get(getRepositoryToken(TransferRequest));
  });

  it('creates a transfer request with default status Initiated', async () => {
    const dto = {
      assetId: 'A-1',
      requestedBy: 'user-1',
      fromLocation: 'Lagos',
      toLocation: 'Abuja',
      reason: 'Relocation',
    };
    const entity = { id: 'x', ...dto, status: TransferStatus.Initiated } as TransferRequest;

    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);

    const created = await service.create(dto as any);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ assetId: 'A-1' }));
    expect(created.status).toBe(TransferStatus.Initiated);
  });

  it('updates a transfer to Delivered and sets approvalDate', async () => {
    const existing = {
      id: 'x',
      status: TransferStatus.Initiated,
      approvalDate: null,
      toLocation: 'Abuja',
      fromLocation: 'Lagos',
    } as TransferRequest;

    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation(async (e) => e as TransferRequest);

    const updated = await service.update('x', { status: TransferStatus.Delivered });
    expect(updated.status).toBe(TransferStatus.Delivered);
    expect(updated.approvalDate).toBeInstanceOf(Date);
  });

  it('findMany supports filtering and pagination', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: '1' } as any], 1]);
    const res = await service.findMany({ destination: 'Abuja', page: 1, limit: 10 } as any);
    expect(res.total).toBe(1);
    expect(Array.isArray(res.data)).toBe(true);
  });
});