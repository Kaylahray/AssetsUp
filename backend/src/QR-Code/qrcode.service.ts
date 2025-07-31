import { Injectable, NotFoundException } from "@nestjs/common";
// ...existing code...
import * as QRCodeLib from "qrcode";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { QRCode } from "./entities/qrcode.entity";

@Injectable()
export class QRCodeService {
  constructor(
    @InjectRepository(QRCode)
    private readonly qrRepo: Repository<QRCode>
  ) {}

  async generate(referenceId: string, data: string): Promise<QRCode> {
    const qrImageBase64 = await QRCodeLib.toDataURL(data);

    const qr = this.qrRepo.create({
      referenceId,
      data,
      imageUrl: qrImageBase64,
    });

    return this.qrRepo.save(qr);
  }
  /**
   * Returns a QR code image (PNG or SVG) for the given QR code id.
   * The QR code encodes asset info and a link to the asset details endpoint.
   */
  async getQRCodeImage(
    id: string,
    format: "svg" | "png" = "png"
  ): Promise<{ image: Buffer | string; mimeType: string }> {
    const qr = await this.qrRepo.findOneBy({ id });
    if (!qr) throw new NotFoundException("QR code not found");
    // Compose QR data: asset info + link
    const assetInfo = {
      referenceId: qr.referenceId,
      createdAt: qr.createdAt,
    };
    // The link to view asset details (customize as needed)
    const assetLink = `${
      process.env.ASSET_BASE_URL || "https://yourdomain.com/assets"
    }/${qr.referenceId}`;
    const qrPayload = JSON.stringify({ ...assetInfo, link: assetLink });
    if (format === "svg") {
      const svg = await QRCodeLib.toString(qrPayload, { type: "svg" });
      return { image: svg, mimeType: "image/svg+xml" };
    } else {
      const pngBuffer = await QRCodeLib.toBuffer(qrPayload, { type: "png" });
      return { image: pngBuffer, mimeType: "image/png" };
    }
  }
}
