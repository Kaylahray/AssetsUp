import { SetMetadata } from "@nestjs/common"

export const BRANCH_ACCESS_KEY = "branchAccess"

export enum BranchAccessLevel {
  READ = "read",
  WRITE = "write",
  ADMIN = "admin",
}

export const BranchAccess = (level: BranchAccessLevel) => SetMetadata(BRANCH_ACCESS_KEY, level)
