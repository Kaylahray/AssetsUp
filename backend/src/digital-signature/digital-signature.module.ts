import { Module } from '@nestjs/common';
import { DigitalSignatureService } from './digital-signature.service';
import { DigitalSignatureController } from './digital-signature.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DigitalSignature } from './entities/digital-signature.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DigitalSignature])],
  providers: [DigitalSignatureService],
  controllers: [DigitalSignatureController]
})
export class DigitalSignatureModule {}
