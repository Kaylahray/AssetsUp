import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DisposalRecord } from "./disposal-record.entity";
import { DisposalService } from "./disposal.service";
import { DisposalController } from "./disposal.controller";

@Module({
  imports: [TypeOrmModule.forFeature([DisposalRecord])],
  controllers: [DisposalController],
  providers: [DisposalService],
  exports: [DisposalService],
})
export class DisposalModule {}
