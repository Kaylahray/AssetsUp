import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from "@nestjs/swagger"
import  { CountryCurrencyService } from "./country-currency.service"
import  { CreateCountryDto } from "./dto/create-country.dto"
import  { UpdateCountryDto } from "./dto/update-country.dto"
import  { CreateCurrencyDto } from "./dto/create-currency.dto"
import  { UpdateCurrencyDto } from "./dto/update-currency.dto"
import  { ExchangeRateUpdateDto } from "./dto/exchange-rate-update.dto"

@ApiTags('Country & Currency')
@Controller("country-currency")
export class CountryCurrencyController {
  constructor(private readonly countryCurrencyService: CountryCurrencyService) {}

  // Country endpoints
  @Post("countries")
  @ApiOperation({ summary: 'Create a new country' })
  @ApiResponse({ status: 201, description: 'Country created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ type: CreateCountryDto })
  createCountry(@Body() createCountryDto: CreateCountryDto) {
    return this.countryCurrencyService.createCountry(createCountryDto)
  }

  @Get("countries")
  @ApiOperation({ summary: 'Get all countries' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean, description: 'Filter active countries only' })
  @ApiResponse({ status: 200, description: 'Countries retrieved successfully' })
  findAllCountries(@Query('activeOnly') activeOnly?: string) {
    if (activeOnly === "true") {
      return this.countryCurrencyService.findActiveCountries()
    }
    return this.countryCurrencyService.findAllCountries()
  }

  @Get("countries/:id")
  @ApiOperation({ summary: 'Get country by ID' })
  @ApiParam({ name: 'id', description: 'Country ID' })
  @ApiResponse({ status: 200, description: 'Country retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  findCountryById(@Param('id') id: string) {
    return this.countryCurrencyService.findCountryById(id)
  }

  @Get("countries/iso/:isoCode")
  @ApiOperation({ summary: 'Get country by ISO code' })
  @ApiParam({ name: 'isoCode', description: '2 or 3 letter ISO code' })
  @ApiResponse({ status: 200, description: 'Country retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  findCountryByIsoCode(@Param('isoCode') isoCode: string) {
    return this.countryCurrencyService.findCountryByIsoCode(isoCode)
  }

  @Patch("countries/:id")
  @ApiOperation({ summary: 'Update country details' })
  @ApiParam({ name: 'id', description: 'Country ID' })
  @ApiResponse({ status: 200, description: 'Country updated successfully' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  @ApiBody({ type: UpdateCountryDto })
  updateCountry(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
    return this.countryCurrencyService.updateCountry(id, updateCountryDto)
  }

  @Delete("countries/:id")
  @ApiOperation({ summary: 'Delete country' })
  @ApiParam({ name: 'id', description: 'Country ID' })
  @ApiResponse({ status: 200, description: 'Country deleted successfully' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  removeCountry(@Param('id') id: string) {
    return this.countryCurrencyService.removeCountry(id)
  }

  // Currency endpoints
  @Post("currencies")
  @ApiOperation({ summary: 'Create a new currency' })
  @ApiResponse({ status: 201, description: 'Currency created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ type: CreateCurrencyDto })
  createCurrency(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.countryCurrencyService.createCurrency(createCurrencyDto)
  }

  @Get("currencies")
  @ApiOperation({ summary: 'Get all currencies' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean, description: 'Filter active currencies only' })
  @ApiResponse({ status: 200, description: 'Currencies retrieved successfully' })
  findAllCurrencies(@Query('activeOnly') activeOnly?: string) {
    if (activeOnly === "true") {
      return this.countryCurrencyService.findActiveCurrencies()
    }
    return this.countryCurrencyService.findAllCurrencies()
  }

  @Get("currencies/base")
  @ApiOperation({ summary: 'Get base currency' })
  @ApiResponse({ status: 200, description: 'Base currency retrieved successfully' })
  getBaseCurrency() {
    return this.countryCurrencyService.getBaseCurrency()
  }

  @Get("currencies/:id")
  @ApiOperation({ summary: 'Get currency by ID' })
  @ApiParam({ name: 'id', description: 'Currency ID' })
  @ApiResponse({ status: 200, description: 'Currency retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  findCurrencyById(@Param('id') id: string) {
    return this.countryCurrencyService.findCurrencyById(id)
  }

  @Get("currencies/code/:code")
  @ApiOperation({ summary: 'Get currency by code' })
  @ApiParam({ name: 'code', description: '3-letter currency code' })
  @ApiResponse({ status: 200, description: 'Currency retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  findCurrencyByCode(@Param('code') code: string) {
    return this.countryCurrencyService.findCurrencyByCode(code)
  }

  @Patch("currencies/:id")
  @ApiOperation({ summary: 'Update currency details' })
  @ApiParam({ name: 'id', description: 'Currency ID' })
  @ApiResponse({ status: 200, description: 'Currency updated successfully' })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  @ApiBody({ type: UpdateCurrencyDto })
  updateCurrency(@Param('id') id: string, @Body() updateCurrencyDto: UpdateCurrencyDto) {
    return this.countryCurrencyService.updateCurrency(id, updateCurrencyDto)
  }

  @Patch("currencies/:id/exchange-rate")
  @ApiOperation({ summary: 'Update currency exchange rate' })
  @ApiParam({ name: 'id', description: 'Currency ID' })
  @ApiResponse({ status: 200, description: 'Exchange rate updated successfully' })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  @ApiBody({ type: ExchangeRateUpdateDto })
  updateExchangeRate(@Param('id') id: string, @Body() exchangeRateDto: ExchangeRateUpdateDto) {
    return this.countryCurrencyService.updateExchangeRate(id, exchangeRateDto)
  }

  @Post("currencies/exchange-rates/bulk")
  @ApiOperation({ summary: 'Bulk update exchange rates' })
  @ApiResponse({ status: 200, description: 'Exchange rates updated successfully' })
  @ApiBody({ 
    schema: { 
      type: 'array',
      items: {
        type: 'object',
        properties: {
          currencyCode: { type: 'string', example: 'EUR' },
          rate: { type: 'number', example: 1.08 }
        }
      }
    } 
  })
  bulkUpdateExchangeRates(@Body() rates: { currencyCode: string; rate: number }[]) {
    return this.countryCurrencyService.bulkUpdateExchangeRates(rates)
  }

  @Get("currencies/convert/:amount/:from/:to")
  @ApiOperation({ summary: 'Convert currency amount' })
  @ApiParam({ name: 'amount', description: 'Amount to convert' })
  @ApiParam({ name: 'from', description: 'Source currency code' })
  @ApiParam({ name: 'to', description: 'Target currency code' })
  @ApiResponse({ status: 200, description: 'Currency converted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid conversion parameters' })
  convertCurrency(@Param('amount') amount: string, @Param('from') from: string, @Param('to') to: string) {
    return this.countryCurrencyService.convertCurrency(Number.parseFloat(amount), from, to)
  }

  @Get("currencies/:id/history")
  @ApiOperation({ summary: 'Get exchange rate history' })
  @ApiParam({ name: 'id', description: 'Currency ID' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days of history' })
  @ApiResponse({ status: 200, description: 'Exchange rate history retrieved successfully' })
  getExchangeRateHistory(@Param('id') id: string, @Query('days') days?: string) {
    const daysNumber = days ? Number.parseInt(days) : 30
    return this.countryCurrencyService.getExchangeRateHistory(id, daysNumber)
  }

  @Delete("currencies/:id")
  @ApiOperation({ summary: 'Delete currency' })
  @ApiParam({ name: 'id', description: 'Currency ID' })
  @ApiResponse({ status: 200, description: 'Currency deleted successfully' })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  removeCurrency(@Param('id') id: string) {
    return this.countryCurrencyService.removeCurrency(id)
  }
}