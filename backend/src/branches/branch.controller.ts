import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
} from "@nestjs/common";
import { BranchService } from "./branch.service";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";
import { FilterBranchDto } from "./dto/filter-branch.dto";

@Controller("branches")
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  create(@Body() dto: CreateBranchDto) {
    return this.branchService.create(dto);
  }

  @Get()
  findAll(@Query() filters: FilterBranchDto) {
    return this.branchService.findAll(filters);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.branchService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateBranchDto) {
    return this.branchService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.branchService.remove(id);
  }
}
