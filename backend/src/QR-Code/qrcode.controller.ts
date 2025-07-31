import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Res,
  Query,
} from "@nestjs/common";
import { Response } from "express";
import { QRCodeService } from "./qrcode.service";

@Controller("qrcode")
export class QRCodeController {
  constructor(private readonly qrService: QRCodeService) {}

  @Post()
  generate(@Body() body: { referenceId: string; data: string }) {
    return this.qrService.generate(body.referenceId, body.data);
  }

  /**
   * Returns the QR code image (PNG or SVG) for the given assetId.
   * Query param: format=svg|png (default: png)
   */
  @Get(":id")
  async getQRCodeImage(
    @Param("id") id: string,
    @Query("format") format: "svg" | "png" = "png",
    @Res() res: Response
  ) {
    const { image, mimeType } = await this.qrService.getQRCodeImage(id, format);
    res.setHeader("Content-Type", mimeType);
    if (format === "svg") {
      res.send(image);
    } else {
      // image is a Buffer for PNG
      res.end(image, "binary");
    }
  }

  // Removed delete and scanMock endpoints as the service methods do not exist.
}
