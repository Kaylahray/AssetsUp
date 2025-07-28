export interface DepreciationCalculationResult {
  year: number;
  beginningBookValue: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  endingBookValue: number;
}

export interface DepreciationSchedule {
  assetId: string;
  assetName: string;
  method: string;
  initialCost: number;
  residualValue: number;
  usefulLife: number;
  totalDepreciation: number;
  schedule: DepreciationCalculationResult[];
}