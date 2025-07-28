import { Injectable, BadRequestException } from '@nestjs/common';
import { CalculateDepreciationDto } from '../dto/calculate-depreciation.dto';
import { DepreciationMethod } from '../enums/depreciation-method.enum';
import {
  DepreciationSchedule,
  DepreciationCalculationResult,
} from '../interfaces/depreciation-calculation.interface';

@Injectable()
export class DepreciationService {
  calculateDepreciation(dto: CalculateDepreciationDto): DepreciationSchedule {
    this.validateInput(dto);

    const schedule = this.generateDepreciationSchedule(dto);

    return {
      assetId: dto.assetId,
      assetName: dto.assetName,
      method: dto.method,
      initialCost: dto.initialCost,
      residualValue: dto.residualValue,
      usefulLife: dto.usefulLife,
      totalDepreciation: dto.initialCost - dto.residualValue,
      schedule,
    };
  }

  private validateInput(dto: CalculateDepreciationDto): void {
    if (dto.residualValue >= dto.initialCost) {
      throw new BadRequestException(
        'Residual value must be less than initial cost',
      );
    }

    if (dto.method === DepreciationMethod.DECLINING_BALANCE && !dto.depreciationRate) {
      throw new BadRequestException(
        'Depreciation rate is required for declining balance method',
      );
    }

    if (dto.depreciationRate && (dto.depreciationRate <= 0 || dto.depreciationRate > 1)) {
      throw new BadRequestException(
        'Depreciation rate must be between 0 and 1',
      );
    }
  }

  private generateDepreciationSchedule(
    dto: CalculateDepreciationDto,
  ): DepreciationCalculationResult[] {
    switch (dto.method) {
      case DepreciationMethod.STRAIGHT_LINE:
        return this.calculateStraightLine(dto);
      case DepreciationMethod.DECLINING_BALANCE:
        return this.calculateDecliningBalance(dto);
      case DepreciationMethod.DOUBLE_DECLINING_BALANCE:
        return this.calculateDoubleDecliningBalance(dto);
      case DepreciationMethod.SUM_OF_YEARS_DIGITS:
        return this.calculateSumOfYearsDigits(dto);
      default:
        throw new BadRequestException('Unsupported depreciation method');
    }
  }

  private calculateStraightLine(
    dto: CalculateDepreciationDto,
  ): DepreciationCalculationResult[] {
    const annualDepreciation = (dto.initialCost - dto.residualValue) / dto.usefulLife;
    const schedule: DepreciationCalculationResult[] = [];

    let accumulatedDepreciation = 0;

    for (let year = 1; year <= dto.usefulLife; year++) {
      const beginningBookValue = dto.initialCost - accumulatedDepreciation;
      const depreciationExpense = annualDepreciation;
      accumulatedDepreciation += depreciationExpense;
      const endingBookValue = dto.initialCost - accumulatedDepreciation;

      schedule.push({
        year,
        beginningBookValue: Math.round(beginningBookValue * 100) / 100,
        depreciationExpense: Math.round(depreciationExpense * 100) / 100,
        accumulatedDepreciation: Math.round(accumulatedDepreciation * 100) / 100,
        endingBookValue: Math.round(endingBookValue * 100) / 100,
      });
    }

    return schedule;
  }

  private calculateDecliningBalance(
    dto: CalculateDepreciationDto,
  ): DepreciationCalculationResult[] {
    const schedule: DepreciationCalculationResult[] = [];
    let accumulatedDepreciation = 0;

    for (let year = 1; year <= dto.usefulLife; year++) {
      const beginningBookValue = dto.initialCost - accumulatedDepreciation;
      let depreciationExpense = beginningBookValue * dto.depreciationRate;

      // Ensure we don't depreciate below residual value
      const maxDepreciation = beginningBookValue - dto.residualValue;
      if (depreciationExpense > maxDepreciation) {
        depreciationExpense = maxDepreciation;
      }

      accumulatedDepreciation += depreciationExpense;
      const endingBookValue = dto.initialCost - accumulatedDepreciation;

      schedule.push({
        year,
        beginningBookValue: Math.round(beginningBookValue * 100) / 100,
        depreciationExpense: Math.round(depreciationExpense * 100) / 100,
        accumulatedDepreciation: Math.round(accumulatedDepreciation * 100) / 100,
        endingBookValue: Math.round(endingBookValue * 100) / 100,
      });

      // Stop if we've reached residual value
      if (endingBookValue <= dto.residualValue) {
        break;
      }
    }

    return schedule;
  }

  private calculateDoubleDecliningBalance(
    dto: CalculateDepreciationDto,
  ): DepreciationCalculationResult[] {
    const rate = 2 / dto.usefulLife;
    return this.calculateDecliningBalance({ ...dto, depreciationRate: rate });
  }

  private calculateSumOfYearsDigits(
    dto: CalculateDepreciationDto,
  ): DepreciationCalculationResult[] {
    const sumOfYears = (dto.usefulLife * (dto.usefulLife + 1)) / 2;
    const depreciableAmount = dto.initialCost - dto.residualValue;
    const schedule: DepreciationCalculationResult[] = [];

    let accumulatedDepreciation = 0;

    for (let year = 1; year <= dto.usefulLife; year++) {
      const beginningBookValue = dto.initialCost - accumulatedDepreciation;
      const remainingYears = dto.usefulLife - year + 1;
      const depreciationExpense = (remainingYears / sumOfYears) * depreciableAmount;
      
      accumulatedDepreciation += depreciationExpense;
      const endingBookValue = dto.initialCost - accumulatedDepreciation;

      schedule.push({
        year,
        beginningBookValue: Math.round(beginningBookValue * 100) / 100,
        depreciationExpense: Math.round(depreciationExpense * 100) / 100,
        accumulatedDepreciation: Math.round(accumulatedDepreciation * 100) / 100,
        endingBookValue: Math.round(endingBookValue * 100) / 100,
      });
    }

    return schedule;
  }
}