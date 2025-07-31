export class CreateComplianceDto {
  type: string;
  deadline: Date;
  notes?: string;
  assetId?: string;
  assetTitle?: string;
}

export class UpdateComplianceDto {
  status?: "PENDING" | "COMPLETED" | "OVERDUE";
  notes?: string;
  deadline?: Date;
  certificationUrl?: string;
}
