import { Test, TestingModule } from '@nestjs/testing';
import { ContractsController } from '../../src/contracts/contracts.controller';
import { ContractsService } from '../../src/contracts/contracts.service';

describe('ContractsController', () => {
  let controller: ContractsController;
  let service: ContractsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractsController],
      providers: [
        {
          provide: ContractsService,
          useValue: {
            createContract: jest.fn(),
            findAllContracts: jest.fn(),
            findOneContract: jest.fn(),
            updateContract: jest.fn(),
            removeContract: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ContractsController>(ContractsController);
    service = module.get<ContractsService>(ContractsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service to create a contract', async () => {
    const dto = { title: 'Test', vendorId: 'vendor-123' } as any;
    (service.createContract as jest.Mock).mockResolvedValue(dto);
    expect(await controller.create(dto)).toEqual(dto);
    expect(service.createContract).toHaveBeenCalledWith(dto);
  });
});
