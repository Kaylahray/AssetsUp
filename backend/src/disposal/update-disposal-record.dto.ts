import { PartialType } from "@nestjs/mapped-types";
import { CreateDisposalRecordDto } from "./create-disposal-record.dto";

export class UpdateDisposalRecordDto extends PartialType(
  CreateDisposalRecordDto
) {}
