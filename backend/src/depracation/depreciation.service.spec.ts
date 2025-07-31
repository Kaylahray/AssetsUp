import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DepreciationService } from '../services/depreciation.service';
import { CalculateDepreciationDto } from '../dto/calculate-depreciation.dto';
import { DepreciationMethod } from '../enums/depreciation-method.enum';

describe('DepreciationService', () => {
  let service: DepreciationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepreciationService],
    }).compile();

    service = module.get<DepreciationService>(DepreciationService);
  });

  describe('validateInput', () => {
    it('should throw error when residual value >= initial cost', () => {
      const dto: CalculateDepreciationDto = {
        assetId: 'test-001',
        assetName: 'Test Asset',
        initialCost: 10000,
        residualValue: 15000,
        usefulLife: 5,
        method: DepreciationMethod.STRAIGHT_LINE,
      };

      expect(() => service.calculateDepreciation(dto)).toThrow(BadRequestException);
    });

    it('should throw error when declining balance method lacks depreciation rate', () => {
      const dto: CalculateDepreciationDto = {
        assetId: 'test-001',
        assetName: 'Test Asset',
        initialCost: 10000,
        residualValue: 1000,
        usefulLife: 5,
        method: DepreciationMethod.DECLINING_BALANCE,
      };

      expect(() => service.calculateDepreciation(dto)).toThrow(BadRequestException);
    });
  });

  describe('calculateStraightLine', () => {
    it('should calculate straight-line depreciation correctly', () => {
      const dto: CalculateDepreciationDto = {
        assetId: 'test-001',
        assetName: 'Test Equipment',
        initialCost: 10000,
        residualValue: 1000,
        usefulLife: 3,
        method: DepreciationMethod.STRAIGHT_LINE,
      };

      const result = service.calculateDepreciation(dto);

      expect(result.totalDepreciation).toBe(9000);
      expect(result.schedule).toHaveLength(3);
      
      // Year 1
      expect(result.schedule[0].year).toBe(1);
      expect(result.schedule[0].beginningBookValue).toBe(10000);
      expect(result.schedule[0].depreciationExpense).toBe(3000);
      expect(result.schedule[0].accumulatedDepreciation).toBe(3000);
      expect(result.schedule[0].endingBookValue).toBe(7000);

      // Year 2
      expect(result.schedule[1].year).toBe(2);
      expect(result.schedule[1].beginningBookValue).toBe(7000);
      expect(result.schedule[1].depreciationExpense).toBe(3000);
      expect(result.schedule[1].accumulatedDepreciation).toBe(6000);
      expect(result.schedule[1].endingBookValue).toBe(4000);

      // Year 3
      expect(result.schedule[2].year).toBe(3);
      expect(result.schedule[2].beginningBookValue).toBe(4000);
      expect(result.schedule[2].depreciationExpense).toBe(3000);
      expect(result.schedule[2].accumulatedDepreciation).toBe(9000);
      expect(result.schedule[2].endingBookValue).toBe(1000);
    });
  });

  describe('calculateDecliningBalance', () => {
    it('should calculate declining balance depreciation correctly', () => {
      const dto: CalculateDepreciationDto = {
        assetId: 'test-001',
        assetName: 'Test Equipment',
        initialCost: 10000,
        residualValue: 1000,
        usefulLife: 5,
        method: DepreciationMethod.DECLINING_BALANCE,
        depreciationRate: 0.4,
      };

      const result = service.calculateDepreciation(dto);

      expect(result.schedule).toHaveLength(5);
      
      // Year 1: 10000 * 0.4 = 4000
      expect(result.schedule[0].depreciationExpense).toBe(4000);
      expect(result.schedule[0].endingBookValue).toBe(6000);

      // Year 2: 6000 * 0.4 = 2400
      expect(result.schedule[1].depreciationExpense).toBe(2400);
      expect(result.schedule[1].endingBookValue).toBe(3600);
    });

    it('should not depreciate below residual value', () => {
      const dto: CalculateDepreciationDto = {
        assetId: 'test-001',
        assetName: 'Test Equipment',
        initialCost: 1000,
        residualValue: 100,
        usefulLife: 3,
        method: DepreciationMethod.DECLINING_BALANCE,
        depreciationRate: 0.8,
      };

      const result = service.calculateDepreciation(dto);

      // Last year should not go below residual value
      const lastYear = result.schedule[result.schedule.length - 1];
      expect(lastYear.endingBookValue).toBeGreaterThanOrEqual(dto.residualValue);
    });
  });

  describe('calculateDoubleDecliningBalance', () => {
    it('should calculate double declining balance correctly', () => {
      const dto: CalculateDepreciationDto = {
        assetId: 'test-001',
        assetName: 'Test Equipment',
        initialCost: 10000,
        residualValue: 1000,
        usefulLife: 5,
        method: DepreciationMethod.DOUBLE_DECLINING_BALANCE,
      };

      const result = service.calculateDepreciation(dto);

      // Rate should be 2/5 = 0.4
      // Year 1: 10000 * 0.4 = 4000
      expect(result.schedule[0].depreciationExpense).toBe(4000);
      expect(result.schedule[0].endingBookValue).toBe(6000);
    });
  });

  describe('calculateSumOfYearsDigits', () => {
    it('should calculate sum of years digits correctly', () => {
      const dto: CalculateDepreciationDto = {
        assetId: 'test-001',
        assetName: 'Test Equipment',
        initialCost: 10000,
        residualValue: 1000,
        usefulLife: 3,
        method: DepreciationMethod.SUM_OF_YEARS_DIGITS,
      };

      const result = service.calculateDepreciation(dto);

      // Sum of years: 1+2+3 = 6
      // Depreciable amount: 9000
      
      // Year 1: (3/6) * 9000 = 4500
      expect(result.schedule[0].depreciationExpense).toBe(4500);
      
      // Year 2: (2/6) * 9000 = 3000
      expect(result.schedule[1].depreciationExpense).toBe(3000);
      
      // Year 3: (1/6) * 9000 = 1500
      expect(result.schedule[2].depreciationExpense).toBe(1500);

      // Total should equal depreciable amount
      const totalDepreciation = result.schedule.reduce(
        (sum, year) => sum + year.depreciationExpense,
        0,
      );
      expect(totalDepreciation).toBe(9000);
    });
  });

  describe('edge cases', () => {
    it('should handle zero residual value', () => {
      const dto: CalculateDepreciationDto = {
        assetId: 'test-001',
        assetName: 'Test Equipment',
        initialCost: 1000,
        residualValue: 0,
        usefulLife: 2,
        method: DepreciationMethod.STRAIGHT_LINE,
      };

      const result = service.calculateDepreciation(dto);

      expect(result.totalDepreciation).toBe(1000);
      expect(result.schedule[1].endingBookValue).toBe(0);
    });

    it('should handle single year useful life', () => {
      const dto: CalculateDepreciationDto = {
        assetId: 'test-001',
        assetName: 'Test Equipment',
        initialCost: 1000,
        residualValue: 100,
        usefulLife: 1,
        method: DepreciationMethod.STRAIGHT_LINE,
      };

      const result = service.calculateDepreciation(dto);

      expect(result.schedule).toHaveLength(1);
      expect(result.schedule[0].depreciationExpense).toBe(900);
      expect(result.schedule[0].endingBookValue).toBe(100);
    });
  });
});