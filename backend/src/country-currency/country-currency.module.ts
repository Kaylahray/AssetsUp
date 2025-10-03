import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CountryCurrencyService } from "./country-currency.service"
import { CountryCurrencyController } from "./country-currency.controller"
import { Country } from "./entities/country.entity"
import { Currency } from "./entities/currency.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Country, Currency])],
  controllers: [CountryCurrencyController],
  providers: [CountryCurrencyService],
  exports: [CountryCurrencyService, TypeOrmModule],
})
export class CountryCurrencyModule {}
