import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { DisposalService } from "./disposal.service";
import { CreateDisposalRecordDto } from "./dto/create-disposal-record.dto";
import { UpdateDisposalRecordDto } from "./dto/update-disposal-record.dto";

@Controller("disposals")
export class DisposalController {
  constructor(private readonly service: DisposalService) {}

  @Post()
  create(@Body() dto: CreateDisposalRecordDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateDisposalRecordDto) {
    return this.service.update(id, dto);
  }

  // Soft delete
  @Delete(":id")
  async softDelete(@Param("id") id: string) {
    await this.service.softDelete(id);
    return { message: "Record soft-deleted" };
  }

  // Restore soft-deleted
  @Post(":id/restore")
  async restore(@Param("id") id: string) {
    await this.service.restore(id);
    return { message: "Record restored" };
  }

  // Hard delete (optional, for admins/tools)
  @Delete(":id/permanent")
  async removePermanently(@Param("id") id: string) {
    await this.service.removePermanently(id);
    return { message: "Record permanently deleted" };
  }
}
