import { Controller, Get, Post, Patch, Delete } from "@nestjs/common"
import type { CountryCurrencyService } from "./country-currency.service"
import type { CreateCountryDto } from "./dto/create-country.dto"
import type { UpdateCountryDto } from "./dto/update-country.dto"
import type { CreateCurrencyDto } from "./dto/create-currency.dto"
import type { UpdateCurrencyDto } from "./dto/update-currency.dto"
import type { ExchangeRateUpdateDto } from "./dto/exchange-rate-update.dto"

@Controller("country-currency")
export class CountryCurrencyController {
  constructor(private readonly countryCurrencyService: CountryCurrencyService) {}

  // Country endpoints
  @Post("countries")
  createCountry(createCountryDto: CreateCountryDto) {
    return this.countryCurrencyService.createCountry(createCountryDto)
  }

  @Get("countries")
  findAllCountries(activeOnly?: string) {
    if (activeOnly === "true") {
      return this.countryCurrencyService.findActiveCountries()
    }
    return this.countryCurrencyService.findAllCountries()
  }

  @Get("countries/:id")
  findCountryById(id: string) {
    return this.countryCurrencyService.findCountryById(id)
  }

  @Get("countries/iso/:isoCode")
  findCountryByIsoCode(isoCode: string) {
    return this.countryCurrencyService.findCountryByIsoCode(isoCode)
  }

  @Patch("countries/:id")
  updateCountry(id: string, updateCountryDto: UpdateCountryDto) {
    return this.countryCurrencyService.updateCountry(id, updateCountryDto)
  }

  @Delete("countries/:id")
  removeCountry(id: string) {
    return this.countryCurrencyService.removeCountry(id)
  }

  // Currency endpoints
  @Post("currencies")
  createCurrency(createCurrencyDto: CreateCurrencyDto) {
    return this.countryCurrencyService.createCurrency(createCurrencyDto)
  }

  @Get("currencies")
  findAllCurrencies(activeOnly?: string) {
    if (activeOnly === "true") {
      return this.countryCurrencyService.findActiveCurrencies()
    }
    return this.countryCurrencyService.findAllCurrencies()
  }

  @Get("currencies/base")
  getBaseCurrency() {
    return this.countryCurrencyService.getBaseCurrency()
  }

  @Get("currencies/:id")
  findCurrencyById(id: string) {
    return this.countryCurrencyService.findCurrencyById(id)
  }

  @Get("currencies/code/:code")
  findCurrencyByCode(code: string) {
    return this.countryCurrencyService.findCurrencyByCode(code)
  }

  @Patch("currencies/:id")
  updateCurrency(id: string, updateCurrencyDto: UpdateCurrencyDto) {
    return this.countryCurrencyService.updateCurrency(id, updateCurrencyDto)
  }

  @Patch("currencies/:id/exchange-rate")
  updateExchangeRate(id: string, exchangeRateDto: ExchangeRateUpdateDto) {
    return this.countryCurrencyService.updateExchangeRate(id, exchangeRateDto)
  }

  @Post("currencies/exchange-rates/bulk")
  bulkUpdateExchangeRates(rates: { currencyCode: string; rate: number }[]) {
    return this.countryCurrencyService.bulkUpdateExchangeRates(rates)
  }

  @Get("currencies/convert/:amount/:from/:to")
  convertCurrency(amount: string, from: string, to: string) {
    return this.countryCurrencyService.convertCurrency(Number.parseFloat(amount), from, to)
  }

  @Get("currencies/:id/history")
  getExchangeRateHistory(id: string, days?: string) {
    const daysNumber = days ? Number.parseInt(days) : 30
    return this.countryCurrencyService.getExchangeRateHistory(id, daysNumber)
  }

  @Delete("currencies/:id")
  removeCurrency(id: string) {
    return this.countryCurrencyService.removeCurrency(id)
  }
}
