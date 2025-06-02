import { ApiProperty } from "@nestjs/swagger"
import type { Branch } from "../entities/branch.entity"

export class BranchResponseDto {
  @ApiProperty({ description: "Branch data" })
  data: Branch[]

  @ApiProperty({ description: "Pagination metadata" })
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export class BranchStatsDto {
  @ApiProperty({ description: "Branch information" })
  branch: {
    id: string
    name: string
    branchCode: string
  }

  @ApiProperty({ description: "Branch statistics" })
  stats: {
    totalAssets: number
    activeAssets: number
    totalInventories: number
    totalUsers: number
    totalTransactions: number
  }
}
