import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DepreciationController } from '../controllers/depreciation.controller';
import { DepreciationService } from '../services/depreciation.service';
import { CalculateDepreciationDto } from '../dto/calculate-depreciation.dto';
import { DepreciationMethod } from '../enums/depreciation-method.enum';

describe('DepreciationController', () => {
  let controller: DepreciationController;
  let service: DepreciationService;

  const mockDepreciationService = {
    calculateDepreciation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepreciationController],
      providers: [
        {
          provide: DepreciationService,
          useValue: mockDepreciationService,
        },
      ],
    }).compile();

    controller = module.get<DepreciationController>(DepreciationController);
    service = module.get<DepreciationService>(DepreciationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('calculateDepreciation', () => {
    it('should return depreciation calculation result', async () => {
      const dto: CalculateDepreciationDto = {
        assetId: 'test-001',
        assetName: 'Test Equipment',
        initialCost: 10000,
        residualValue: 1000,
        usefulLife: 5,
        method: DepreciationMethod.STRAIGHT_LINE,
      };

      const expectedResult = {
        assetId: 'test-001',
        assetName: 'Test Equipment',
        method: DepreciationMethod.STRAIGHT_LINE,
        initialCost: 10000,
        residualValue: 1000,
        usefulLife: 5,
        totalDepreciation: 9000,
        schedule: [
          {
            year: 1,
            beginningBookValue: 10000,
            depreciationExpense: 1800,
            accumulatedDepreciation: 1800,
            endingBookValue: 8200,
          },
        ],
      };

      mockDepreciationService.calculateDepreciation.mockReturnValue(expectedResult);

      const result = controller.calculateDepreciation(dto);

      expect(service.calculateDepreciation).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate service errors', () => {
      const dto: CalculateDepreciationDto = {
        assetId: 'test-001',
        assetName: 'Test Equipment',
        initialCost: 10000,
        residualValue: 15000, // Invalid: greater than initial cost
        usefulLife: 5,
        method: DepreciationMethod.STRAIGHT_LINE,
      };

      mockDepreciationService.calculateDepreciation.mockImplementation(() => {
        throw new BadRequestException('Residual value must be less than initial cost');
      });

      expect(() => controller.calculateDepreciation(dto)).toThrow(BadRequestException);
    });
  });
});