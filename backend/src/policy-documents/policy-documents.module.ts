import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MulterModule } from "@nestjs/platform-express";
import { PolicyDocumentsService } from "./policy-documents.service";
import { PolicyDocumentsController } from "./policy-documents.controller";
import { PolicyDocument } from "./entities/policy-document.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([PolicyDocument]),
    MulterModule.register({
      dest: "./uploads/policy-documents",
    }),
  ],
  controllers: [PolicyDocumentsController],
  providers: [PolicyDocumentsService],
  exports: [PolicyDocumentsService],
})
export class PolicyDocumentsModule {} 