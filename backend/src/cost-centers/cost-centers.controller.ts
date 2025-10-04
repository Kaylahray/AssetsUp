import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CostCentersService } from './cost-centers.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';


@Controller('cost-centers')
export class CostCentersController {
constructor(private readonly svc: CostCentersService) {}


@Post()
create(@Body() dto: CreateCostCenterDto) {
return this.svc.create(dto);
}


@Get()
findAll() {
return this.svc.findAll();
}


@Get(':id')
findOne(@Param('id') id: string) {
return this.svc.findOne(id);
}


@Patch(':id')
update(@Param('id') id: string, @Body() dto: UpdateCostCenterDto) {
return this.svc.update(id, dto);
}


@Delete(':id')
remove(@Param('id') id: string) {
return this.svc.remove(id);
}


// Link existing asset to cost center
@Post(':id/assets/:assetId')
attachAsset(@Param('id') id: string, @Param('assetId') assetId: string) {
return this.svc.attachAsset(id, assetId);
}


// Link existing expense to cost center
@Post(':id/expenses/:expenseId')
attachExpense(@Param('id') id: string, @Param('expenseId') expenseId: string) {
return this.svc.attachExpense(id, expenseId);
}
}