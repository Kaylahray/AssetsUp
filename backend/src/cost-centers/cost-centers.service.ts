import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
}


async remove(id: string) {
const cc = await this.repo.findOne({ where: { id } });
if (!cc) throw new NotFoundException('Cost center not found');
// Optionally: check if assets/expenses exist and prevent deletion
const hasChildren = await this.repo.manager
.getRepository('Asset')
.createQueryBuilder('a')
.where('a.costCenterId = :id', { id })
.getCount();


if (hasChildren > 0) {
throw new BadRequestException('Cannot delete cost center with linked assets');
}


await this.repo.remove(cc);
return { deleted: true };
}


// Helper: attach existing asset/expense to cost center by id
async attachAsset(costCenterId: string, assetId: string) {
// This method uses query runner / repository to update asset's foreign key
const cc = await this.repo.findOne({ where: { id: costCenterId } });
if (!cc) throw new NotFoundException('Cost center not found');


const assetRepo = this.repo.manager.getRepository('Asset');
const asset = await assetRepo.findOne({ where: { id: assetId } });
if (!asset) throw new NotFoundException('Asset not found');


asset.costCenterId = costCenterId;
await assetRepo.save(asset);
return asset;
}


async attachExpense(costCenterId: string, expenseId: string) {
const cc = await this.repo.findOne({ where: { id: costCenterId } });
if (!cc) throw new NotFoundException('Cost center not found');


const expenseRepo = this.repo.manager.getRepository('Expense');
const expense = await expenseRepo.findOne({ where: { id: expenseId } });
if (!expense) throw new NotFoundException('Expense not found');


expense.costCenterId = costCenterId;
await expenseRepo.save(expense);
return expense;
}
}