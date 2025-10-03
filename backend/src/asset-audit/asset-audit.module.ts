import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AssetAuditService } from "./asset-audit.service"
import { AssetAuditController } from "./asset-audit.controller"
import { AssetAudit } from "./entities/asset-audit.entity"

@Module({
  imports: [TypeOrmModule.forFeature([AssetAudit])],
  controllers: [AssetAuditController],
  providers: [AssetAuditService],
  exports: [AssetAuditService],
})
export class AssetAuditModule {}
