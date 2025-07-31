import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { I18nService } from './i18n.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('i18n')
@Controller('i18n')
export class I18nController {
  constructor(private readonly i18nService: I18nService) {}

  @Get('languages')
  @ApiOperation({ summary: 'Get available languages' })
  @ApiResponse({ status: 200, description: 'List of available languages' })
  async getAvailableLanguages() {
    const languages = await this.i18nService.getAvailableLanguages();
    const supported = this.i18nService.getSupportedLanguages();
    
    return {
      available: languages,
      supported: Object.keys(supported).map(code => ({
        code,
        name: supported[code]
      })),
      current: this.i18nService.getCurrentLanguage()
    };
  }

  @Get('translate')
  @ApiOperation({ summary: 'Translate a specific key' })
  @ApiQuery({ name: 'key', description: 'Translation key' })
  @ApiQuery({ name: 'lang', description: 'Language code', required: false })
  @ApiResponse({ status: 200, description: 'Translated text' })
  translateKey(
    @Query('key') key: string,
    @Query('lang') lang?: string
  ) {
    if (lang) {
      return {
        key,
        translation: this.i18nService.translateWithLang(key, lang),
        language: lang
      };
    }
    
    return {
      key,
      translation: this.i18nService.translate(key),
      language: this.i18nService.getCurrentLanguage()
    };
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current language' })
  @ApiResponse({ status: 200, description: 'Current language information' })
  getCurrentLanguage() {
    const currentLang = this.i18nService.getCurrentLanguage();
    const supported = this.i18nService.getSupportedLanguages();
    
    return {
      code: currentLang,
      name: supported[currentLang] || currentLang,
      isSupported: Object.keys(supported).includes(currentLang)
    };
  }
}