import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AssetsService } from "./assets.service"
import { AssetsController } from "./assets.controller"
import { Asset } from "./entities/asset.entity"
import { AssetTransfer } from "./entities/asset-transfer.entity"
import { AssetCheckout } from "./entities/asset-checkout.entity"
import { AssetTransfersService } from "./asset-transfers.service"
import { AssetTransfersController } from "./asset-transfers.controller"
import { AssetCheckoutsService } from "./asset-checkouts.service"
import { AssetCheckoutsController } from "./asset-checkouts.controller"
import { StarknetModule } from "../starknet/starknet.module"
import { NotificationsModule } from "../notifications/notifications.module"
import { User } from "../users/entities/user.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Asset, AssetTransfer, AssetCheckout, User]), StarknetModule, NotificationsModule],
  controllers: [AssetsController, AssetTransfersController, AssetCheckoutsController],
  providers: [AssetsService, AssetTransfersService, AssetCheckoutsService],
  exports: [AssetsService, AssetTransfersService, AssetCheckoutsService],
})
export class AssetsModule {}
