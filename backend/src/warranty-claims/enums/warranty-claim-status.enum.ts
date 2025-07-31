export enum WarrantyClaimStatus {
  SUBMITTED = 'Submitted',
  IN_REVIEW = 'In Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  RESOLVED = 'Resolved',
}

export const VALID_STATUS_TRANSITIONS: Record<WarrantyClaimStatus, WarrantyClaimStatus[]> = {
  [WarrantyClaimStatus.SUBMITTED]: [WarrantyClaimStatus.IN_REVIEW, WarrantyClaimStatus.REJECTED],
  [WarrantyClaimStatus.IN_REVIEW]: [WarrantyClaimStatus.APPROVED, WarrantyClaimStatus.REJECTED],
  [WarrantyClaimStatus.APPROVED]: [WarrantyClaimStatus.RESOLVED],
  [WarrantyClaimStatus.REJECTED]: [],
  [WarrantyClaimStatus.RESOLVED]: [],
};