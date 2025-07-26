import { Module } from "@nestjs/common";
import {
  I18nModule as NestI18nModule,
  AcceptLanguageResolver,
  QueryResolver,
  HeaderResolver,
} from "nestjs-i18n";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { I18nService } from "./i18n.service";
import { I18nController } from "./i18n.controller";

@Module({
  imports: [
    NestI18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get("DEFAULT_LANGUAGE", "en"),
        loaderOptions: {
          path: join(__dirname, "../i18n/"),
          watch: true,
        },
        resolvers: [
          { use: QueryResolver, options: ["lang"] },
          { use: HeaderResolver, options: ["accept-language"] },
          AcceptLanguageResolver,
        ],
        typesOutputPath: join(__dirname, "../generated/i18n.generated.ts"),
      }),
    }),
  ],
  controllers: [I18nController],
  providers: [I18nService],
  exports: [I18nService],
})
export class I18nModule {}
