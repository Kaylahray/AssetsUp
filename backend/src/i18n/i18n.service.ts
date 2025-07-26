import { Injectable } from "@nestjs/common";
import { I18nService as NestI18nService, I18nContext } from "nestjs-i18n";
import { readdir } from "fs/promises";
import { join } from "path";

@Injectable()
export class I18nService {
  constructor(private readonly i18n: NestI18nService) {}

  /**
   * Translate a key with optional arguments
   */
  translate(key: string, options?: any): string {
    const lang = I18nContext.current()?.lang || "en";
    return this.i18n.translate(key, { lang, ...options });
  }

  /**
   * Translate with specific language
   */
  translateWithLang(key: string, lang: string, options?: any): string {
    return this.i18n.translate(key, { lang, ...options });
  }

  /**
   * Get available languages from language files
   */
  async getAvailableLanguages(): Promise<string[]> {
    try {
      const i18nPath = join(__dirname, "../i18n");
      const files = await readdir(i18nPath);
      return files
        .filter((file) => file.endsWith(".json"))
        .map((file) => file.replace(".json", ""));
    } catch (error) {
      // Return default languages if directory doesn't exist yet
      return ["en", "es", "fr", "de"];
    }
  }

  /**
   * Get current language from context
   */
  getCurrentLanguage(): string {
    return I18nContext.current()?.lang || "en";
  }

  /**
   * Get supported languages configuration
   */
  getSupportedLanguages(): Record<string, string> {
    return {
      en: "English",
      es: "Español",
      fr: "Français",
      de: "Deutsch",
      pt: "Português",
      it: "Italiano",
      ja: "日本語",
      ko: "한국어",
      zh: "中文",
      ar: "العربية",
    };
  }
}
