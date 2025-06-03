import { BadRequestException, NotFoundException, ConflictException } from "@nestjs/common"

export class BranchNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`Branch with identifier '${identifier}' not found`)
  }
}

export class BranchCodeAlreadyExistsException extends ConflictException {
  constructor(branchCode: string) {
    super(`Branch code '${branchCode}' already exists`)
  }
}

export class BranchHasAssociatedDataException extends BadRequestException {
  constructor(branchId: string, dataTypes: string[]) {
    super(
      `Cannot delete branch '${branchId}' as it has associated ${dataTypes.join(", ")}. Please reassign or remove them first.`,
    )
  }
}

export class BranchInactiveException extends BadRequestException {
  constructor(branchName: string) {
    super(`Branch '${branchName}' is inactive and cannot be used for operations`)
  }
}

export class AssetNotInBranchException extends BadRequestException {
  constructor(assetId: string, branchId: string) {
    super(`Asset '${assetId}' is not assigned to branch '${branchId}'`)
  }
}
