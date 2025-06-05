import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { TransferStatus, TransferType } from "../entities/asset-transfer.entity"
import { Type } from "class-transformer"

class AssetDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: 'MacBook Pro 16"' })
  name: string

  @ApiProperty({ example: "ASSET-2023-001" })
  assetTag: string
}

class UserDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "John Doe" })
  name: string

  @ApiProperty({ example: "john.doe@example.com" })
  email: string
}

export class AssetTransferResponseDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty()
  @Type(() => AssetDto)
  asset: AssetDto

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  assetId: string

  @ApiProperty({ enum: TransferType, example: TransferType.USER_TO_USER })
  transferType: TransferType

  @ApiPropertyOptional()
  @Type(() => UserDto)
  fromUser?: UserDto

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  fromUserId?: string

  @ApiPropertyOptional()
  @Type(() => UserDto)
  toUser?: UserDto

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  toUserId?: string

  @ApiPropertyOptional({ example: "Engineering" })
  fromDepartment?: string

  @ApiPropertyOptional({ example: "Marketing" })
  toDepartment?: string

  @ApiProperty({ example: "2023-01-15T00:00:00.000Z" })
  transferDate: Date

  @ApiPropertyOptional({ example: "2023-02-15T00:00:00.000Z" })
  dueDate?: Date

  @ApiPropertyOptional({ example: "Employee is changing departments" })
  reason?: string

  @ApiProperty({ enum: TransferStatus, example: TransferStatus.PENDING })
  status: TransferStatus

  @ApiPropertyOptional()
  @Type(() => UserDto)
  requestedBy?: UserDto

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  requestedById?: string

  @ApiPropertyOptional()
  @Type(() => UserDto)
  approvedBy?: UserDto

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  approvedById?: string

  @ApiPropertyOptional({ example: "0x123abc..." })
  onChainId?: string

  @ApiPropertyOptional({ example: "Additional notes about the transfer" })
  notes?: string

  @ApiProperty({ example: "2023-01-15T12:00:00.000Z" })
  createdAt: Date

  @ApiProperty({ example: "2023-01-15T12:00:00.000Z" })
  updatedAt: Date
}
