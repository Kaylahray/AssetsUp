import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Certificate } from "./entities/certificate.entity";
import { Asset } from "../asset/entities/asset.entity";
import { User } from "../user/entities/user.entity";

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private certRepo: Repository<Certificate>
  ) {}

  async issueCertificate(data: Partial<Certificate>): Promise<Certificate> {
    const cert = this.certRepo.create({
      ...data,
      status: "valid",
      issuanceDate: new Date(),
    });
    return this.certRepo.save(cert);
  }

  async verifyCertificate(
    id: string
  ): Promise<{ valid: boolean; status: string }> {
    const cert = await this.certRepo.findOne({ where: { id } });
    if (!cert) throw new NotFoundException("Certificate not found");
    const now = new Date();
    if (cert.status === "revoked") return { valid: false, status: "revoked" };
    if (cert.expirationDate && cert.expirationDate < now)
      return { valid: false, status: "expired" };
    return { valid: true, status: "valid" };
  }

  async transferCertificate(id: string, newOwner: User): Promise<Certificate> {
    const cert = await this.certRepo.findOne({ where: { id } });
    if (!cert) throw new NotFoundException("Certificate not found");
    cert.owner = newOwner;
    return this.certRepo.save(cert);
  }

  async revokeCertificate(id: string, reason: string): Promise<Certificate> {
    const cert = await this.certRepo.findOne({ where: { id } });
    if (!cert) throw new NotFoundException("Certificate not found");
    cert.status = "revoked";
    cert.revocationReason = reason;
    cert.revocationDate = new Date();
    return this.certRepo.save(cert);
  }
}
