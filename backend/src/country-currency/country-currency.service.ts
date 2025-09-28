import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Country } from "./entities/country.entity"
import type { Currency } from "./entities/currency.entity"
import type { CreateCountryDto } from "./dto/create-country.dto"
import type { UpdateCountryDto } from "./dto/update-country.dto"
import type { CreateCurrencyDto } from "./dto/create-currency.dto"
import type { UpdateCurrencyDto } from "./dto/update-currency.dto"
import type { ExchangeRateUpdateDto } from "./dto/exchange-rate-update.dto"

@Injectable()
export class CountryCurrencyService {
  constructor(
    private countryRepository: Repository<Country>,
    private currencyRepository: Repository<Currency>,
  ) {}

  // Country methods
  async createCountry(createCountryDto: CreateCountryDto): Promise<Country> {
    const country = this.countryRepository.create(createCountryDto)
    return await this.countryRepository.save(country)
  }

  async findAllCountries(): Promise<Country[]> {
    return await this.countryRepository.find({
      relations: ["currencies"],
      order: { name: "ASC" },
    })
  }

  async findActiveCountries(): Promise<Country[]> {
    return await this.countryRepository.find({
      where: { isActive: true },
      relations: ["currencies"],
      order: { name: "ASC" },
    })
  }

  async findCountryById(id: string): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { id },
      relations: ["currencies"],
    })
    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`)
    }
    return country
  }

  async findCountryByIsoCode(isoCode: string): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: [{ isoCode2: isoCode.toUpperCase() }, { isoCode3: isoCode.toUpperCase() }],
      relations: ["currencies"],
    })
    if (!country) {
      throw new NotFoundException(`Country with ISO code ${isoCode} not found`)
    }
    return country
  }

  async updateCountry(id: string, updateCountryDto: UpdateCountryDto): Promise<Country> {
    const country = await this.findCountryById(id)
    Object.assign(country, updateCountryDto)
    return await this.countryRepository.save(country)
  }

  async removeCountry(id: string): Promise<void> {
    const country = await this.findCountryById(id)
    await this.countryRepository.remove(country)
  }

  // Currency methods
  async createCurrency(createCurrencyDto: CreateCurrencyDto): Promise<Currency> {
    if (createCurrencyDto.countryId) {
      await this.findCountryById(createCurrencyDto.countryId)
    }

    // Ensure only one base currency exists
    if (createCurrencyDto.isBaseCurrency) {
      await this.currencyRepository.update({ isBaseCurrency: true }, { isBaseCurrency: false })
    }

    const currency = this.currencyRepository.create({
      ...createCurrencyDto,
      exchangeRateUpdatedAt: new Date(),
    })
    return await this.currencyRepository.save(currency)
  }

  async findAllCurrencies(): Promise<Currency[]> {
    return await this.currencyRepository.find({
      relations: ["country"],
      order: { code: "ASC" },
    })
  }

  async findActiveCurrencies(): Promise<Currency[]> {
    return await this.currencyRepository.find({
      where: { isActive: true },
      relations: ["country"],
      order: { code: "ASC" },
    })
  }

  async findCurrencyById(id: string): Promise<Currency> {
    const currency = await this.currencyRepository.findOne({
      where: { id },
      relations: ["country"],
    })
    if (!currency) {
      throw new NotFoundException(`Currency with ID ${id} not found`)
    }
    return currency
  }

  async findCurrencyByCode(code: string): Promise<Currency> {
    const currency = await this.currencyRepository.findOne({
      where: { code: code.toUpperCase() },
      relations: ["country"],
    })
    if (!currency) {
      throw new NotFoundException(`Currency with code ${code} not found`)
    }
    return currency
  }

  async getBaseCurrency(): Promise<Currency> {
    const baseCurrency = await this.currencyRepository.findOne({
      where: { isBaseCurrency: true },
      relations: ["country"],
    })
    if (!baseCurrency) {
      throw new NotFoundException("No base currency configured")
    }
    return baseCurrency
  }

  async updateCurrency(id: string, updateCurrencyDto: UpdateCurrencyDto): Promise<Currency> {
    const currency = await this.findCurrencyById(id)

    if (updateCurrencyDto.countryId) {
      await this.findCountryById(updateCurrencyDto.countryId)
    }

    // Ensure only one base currency exists
    if (updateCurrencyDto.isBaseCurrency && !currency.isBaseCurrency) {
      await this.currencyRepository.update({ isBaseCurrency: true }, { isBaseCurrency: false })
    }

    Object.assign(currency, updateCurrencyDto)
    return await this.currencyRepository.save(currency)
  }

  async updateExchangeRate(id: string, exchangeRateDto: ExchangeRateUpdateDto): Promise<Currency> {
    const currency = await this.findCurrencyById(id)

    currency.exchangeRateToUSD = exchangeRateDto.exchangeRateToUSD
    currency.exchangeRateUpdatedAt = exchangeRateDto.exchangeRateUpdatedAt || new Date()

    return await this.currencyRepository.save(currency)
  }

  async bulkUpdateExchangeRates(rates: { currencyCode: string; rate: number }[]): Promise<Currency[]> {
    const updatedCurrencies: Currency[] = []

    for (const rateUpdate of rates) {
      try {
        const currency = await this.findCurrencyByCode(rateUpdate.currencyCode)
        currency.exchangeRateToUSD = rateUpdate.rate
        currency.exchangeRateUpdatedAt = new Date()
        const updated = await this.currencyRepository.save(currency)
        updatedCurrencies.push(updated)
      } catch (error) {
        console.warn(`Failed to update exchange rate for ${rateUpdate.currencyCode}:`, error.message)
      }
    }

    return updatedCurrencies
  }

  async convertCurrency(amount: number, fromCurrencyCode: string, toCurrencyCode: string): Promise<number> {
    if (fromCurrencyCode === toCurrencyCode) {
      return amount
    }

    const fromCurrency = await this.findCurrencyByCode(fromCurrencyCode)
    const toCurrency = await this.findCurrencyByCode(toCurrencyCode)

    // Convert to USD first, then to target currency
    const usdAmount = amount / fromCurrency.exchangeRateToUSD
    const convertedAmount = usdAmount * toCurrency.exchangeRateToUSD

    return Math.round(convertedAmount * Math.pow(10, toCurrency.decimalPlaces)) / Math.pow(10, toCurrency.decimalPlaces)
  }

  async removeCurrency(id: string): Promise<void> {
    const currency = await this.findCurrencyById(id)

    if (currency.isBaseCurrency) {
      throw new BadRequestException("Cannot delete the base currency")
    }

    await this.currencyRepository.remove(currency)
  }

  async getExchangeRateHistory(currencyId: string, days = 30): Promise<any[]> {
    // This would typically query a separate exchange rate history table
    // For now, return the current rate as a placeholder
    const currency = await this.findCurrencyById(currencyId)
    return [
      {
        date: currency.exchangeRateUpdatedAt,
        rate: currency.exchangeRateToUSD,
        currencyCode: currency.code,
      },
    ]
  }
}
