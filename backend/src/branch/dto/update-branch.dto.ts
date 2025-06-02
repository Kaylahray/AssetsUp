import { PartialType, ApiPropertyOptional } from "@nestjs/swagger"
import { CreateBranchDto } from "./create-branch.dto"
import { IsOptional, IsBoolean } from "class-validator"

export class UpdateBranchDto extends PartialType(CreateBranchDto) {
  @ApiPropertyOptional({ description: "Active status" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
